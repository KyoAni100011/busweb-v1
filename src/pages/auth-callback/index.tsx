import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRole } from '@/lib/authRoles';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const userFromUrl = searchParams.get('user');
    const errorFromUrl = searchParams.get('error');

    if (errorFromUrl) {
      setError(errorFromUrl);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (tokenFromUrl && userFromUrl) {
      try {
        const userData = JSON.parse(decodeURIComponent(userFromUrl));
        localStorage.setItem('token', tokenFromUrl);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (isAdminRole(userData)) {
          window.location.href = '/admin';

          return;
        }

        window.location.href = '/';
      } catch (err) {
        setError('Failed to process authentication');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else if (token && user) {
      if (isAdminRole(user)) {
        navigate('/admin');

        return;
      }

      navigate('/');
    } else {
      setError('No authentication data received');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate, token, user]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Authentication Error
          </h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="mt-2 text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}
