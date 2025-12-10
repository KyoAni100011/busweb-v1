import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type AuthResponse } from '@/services/auth.service';
import { isAdminRole } from '@/lib/authRoles';

type User = AuthResponse['user'];

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, username?: string, fullName?: string) => Promise<void>;
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
    console.log('AuthContext: Loading auth data from localStorage');
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('AuthContext: storedToken:', storedToken ? 'exists' : 'null');
      console.log('AuthContext: storedUser:', storedUser);

      if (storedToken && storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log('AuthContext: User loaded:', parsedUser);
        console.log('AuthContext: User roleId:', parsedUser.roleId);
      } else {
        console.log('AuthContext: No valid auth data found');
      }
    } catch (error) {
      console.error('AuthContext: Error loading auth data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Loading complete');
    }
  }, []);

  const handleAuthSuccess = (authData: AuthResponse) => {
    console.log('[AuthContext] handleAuthSuccess - authData:', authData);
    console.log('[AuthContext] user roleId:', authData.user?.roleId);
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

  const register = async (email: string, password: string, username?: string, fullName?: string) => {
    await authService.register({ email, password, username, fullName });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: isAdminRole(user),
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
