import { LoginForm } from '@/pages/login-form';
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginForm />,
  },
]);

export default router;
