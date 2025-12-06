import { LoginForm } from '@/pages/login-form';
import { AuthCallback } from '@/pages/auth-callback';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { RoutesPage } from '@/pages/admin/RoutesPage';
import { BusesPage } from '@/pages/admin/BusesPage';
import { StopsPage } from '@/pages/admin/StopsPage';
import { SeatsPage } from '@/pages/admin/SeatsPage';
import { TripsPage } from '@/pages/admin/TripsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginForm />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'routes',
        element: <RoutesPage />,
      },
      {
        path: 'buses',
        element: <BusesPage />,
      },
      {
        path: 'stops',
        element: <StopsPage />,
      },
      {
        path: 'seats',
        element: <SeatsPage />,
      },
      {
        path: 'trips',
        element: <TripsPage />,
      },
    ],
  },
]);

export default router;
