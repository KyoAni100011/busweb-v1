import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type AuthResponse } from '@/services/auth.service';
import { isAdminRole } from '@/lib/authRoles';

type User = AuthResponse['user'];

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  getMyProfile: (token: string) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<void>;
  handleAuthSuccess: (authData: AuthResponse) => void;
  register: (
    email: string,
    password: string,
    username?: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (authData: AuthResponse) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
  };

  const login = async (email: string, password: string) => {
    const authData = await authService.login({ email, password });
    handleAuthSuccess(authData);
    return authData;
  };

  const getMyProfile = async (token: string) => {
    const authData = await authService.getMyProfile(token);
    handleAuthSuccess(authData);
    return authData;
  };

  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err) {
      console.error('[AuthContext] Google login failed', err);
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    username?: string,
    fullName?: string
  ) => {
    await authService.register({ email, password, username, fullName });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loginWithGoogle,
    handleAuthSuccess,
    getMyProfile,
    isAuthenticated: !!token,
    isAdmin: isAdminRole(user),
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
