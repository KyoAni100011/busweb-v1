import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/booking.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BookingHistoryItem } from '@/types';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  upcomingTrips: number;
  completedTrips: number;
  cancelledBookings: number;
}

const calculateStats = (bookings: BookingHistoryItem[]): DashboardStats => {
  const now = new Date();

  return bookings.reduce(
    (acc, booking) => {
      acc.totalBookings++;
      const departureDate = new Date(booking.trip.departureTime);

      if (booking.status === 'CANCELLED') {
        acc.cancelledBookings++;
      } else if (departureDate > now && booking.status === 'CONFIRMED') {
        acc.upcomingTrips++;
      } else if (departureDate <= now && booking.status === 'CONFIRMED') {
        acc.completedTrips++;
      }

      return acc;
    },
    { totalBookings: 0, upcomingTrips: 0, completedTrips: 0, cancelledBookings: 0 }
  );
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center">
        <div className={`rounded-md p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const RecentBookingCard: React.FC<{ booking: BookingHistoryItem }> = ({ booking }) => (
  <div className="flex items-center justify-between rounded-lg border bg-white p-4">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Ticket className="h-6 w-6 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">
            {booking.trip.originCity} → {booking.trip.destinationCity}
          </h4>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}
          >
            {booking.status}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(booking.trip.departureTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(booking.trip.departureTime)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {booking.seats.join(', ')}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Ref: {booking.referenceCode}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-lg font-semibold text-gray-900">
        {booking.currency} {booking.totalPaid.toLocaleString()}
      </p>
    </div>
  </div>
);

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const data = await bookingService.getBookingHistory();
        setBookings(data);
      } catch (err) {
        setError('Failed to load booking data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const stats = calculateStats(bookings);
  const recentBookings = bookings.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Traveler'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your travel history and upcoming trips.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Ticket}
          color="bg-blue-500"
        />
        <StatsCard
          title="Upcoming Trips"
          value={stats.upcomingTrips}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatsCard
          title="Completed Trips"
          value={stats.completedTrips}
          icon={CheckCircle}
          color="bg-purple-500"
        />
        <StatsCard
          title="Cancelled"
          value={stats.cancelledBookings}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Link to="/user/bookings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <RecentBookingCard key={booking.bookingId} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Ticket className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No bookings yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Start planning your next trip today!
                  </p>
                  <Link to="/">
                    <Button className="mt-4">
                      <Search className="mr-2 h-4 w-4" />
                      Search Trips
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    Search New Trips
                  </Button>
                </Link>
                <Link to="/user/bookings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Ticket className="mr-2 h-4 w-4" />
                    View All Bookings
                  </Button>
                </Link>
                <Link to="/user/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {stats.upcomingTrips > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Calendar className="h-5 w-5" />
                  Upcoming Trip
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings
                  .filter(
                    (b) =>
                      b.status === 'CONFIRMED' &&
                      new Date(b.trip.departureTime) > new Date()
                  )
                  .slice(0, 1)
                  .map((booking) => (
                    <div key={booking.bookingId}>
                      <p className="font-medium text-gray-900">
                        {booking.trip.originCity} → {booking.trip.destinationCity}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(booking.trip.departureTime)} at{' '}
                        {formatTime(booking.trip.departureTime)}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Seats: {booking.seats.join(', ')}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
