import React from 'react';
import { LoginForm } from '@/pages/login-form';
import { AuthCallback } from '@/pages/auth-callback';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { UserLayout } from '@/components/layouts/UserLayout';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { RevenueAnalyticsPage } from '@/pages/admin/RevenueAnalyticsPage';
import { RoutesPage } from '@/pages/admin/RoutesPage';
import { BusesPage } from '@/pages/admin/BusesPage';
import { StopsPage } from '@/pages/admin/StopsPage';
import { SeatsPage } from '@/pages/admin/SeatsPage';
import { TripsPage } from '@/pages/admin/TripsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserPortalLayout } from '@/pages/user/UserPortalLayout';
import { HomePage } from '@/pages/user/HomePage';
import { SearchResultsPage } from '@/pages/user/SearchResultsPage';
import { TripDetailsPage } from '@/pages/user/TripDetailsPage';
import { SeatSelectionPage } from '@/pages/user/SeatSelectionPage';
import { BookingHistoryPage } from '@/pages/user/BookingHistoryPage';
import { GuestLookupPage } from '@/pages/user/GuestLookupPage';
import { UserDashboard } from '@/pages/user/UserDashboard';
import { UserBookingsPage } from '@/pages/user/UserBookingsPage';
import { UserProfilePage } from '@/pages/user/UserProfilePage';
import RegisterPage from '@/pages/register';
import {
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom';
import { PaymentSuccess } from '@/pages/payment/PaymentSuccess';
import PaymentCancel from '@/pages/payment/PaymentCancel';

const RouteError: React.FC = () => {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong';
  const message = isRouteErrorResponse(error)
    ? error.data || 'Please try again.'
    : 'Please try again.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-primary">Error</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{String(message)}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          You can go back or return home.
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="/"
            className="rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
          >
            Go home
          </a>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-md border px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserPortalLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'search',
        element: <SearchResultsPage />,
      },
      {
        path: 'trip/:tripId',
        element: <TripDetailsPage />,
      },
      {
        path: 'trip/:tripId/select-seats',
        element: <SeatSelectionPage />,
      },
      {
        path: 'booking/history',
        element: <BookingHistoryPage />,
      },
      {
        path: 'booking/lookup',
        element: <GuestLookupPage />,
      },

      {
        path: 'payment/success',
        element: <PaymentSuccess />,
      },
      {
        path: 'payment/cancel',
        element: <PaymentCancel />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginForm />,
    errorElement: <RouteError />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <RouteError />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
    errorElement: <RouteError />,
  },
  {
    path: '/user',
    element: (
      <ProtectedRoute requiredRole="USER">
        <UserLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
      {
        path: 'bookings',
        element: <UserBookingsPage />,
      },
      {
        path: 'profile',
        element: <UserProfilePage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'analytics',
        element: <RevenueAnalyticsPage />,
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
