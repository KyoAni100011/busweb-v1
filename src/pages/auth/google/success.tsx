import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function GoogleSuccess() {
  const { getMyProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchUser = async () => {
      try {
        const authData = await getMyProfile(token);

        const isAdmin =
          authData.user?.role === 'ADMIN' ||
          (Array.isArray(authData.user?.roles) &&
            authData.user.roles.some((r) =>
              typeof r === 'string' ? r === 'ADMIN' : r?.name === 'ADMIN'
            ));

        navigate(isAdmin ? '/admin' : '/', { replace: true });
      } catch (err) {
        console.error(err);
        navigate('/login', { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  return <div>Logging in with Google...</div>;
}
