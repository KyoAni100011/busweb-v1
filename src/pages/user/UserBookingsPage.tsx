import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '@/services/booking.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BookingHistoryItem } from '@/types';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  Search,
  Filter,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type FilterStatus = 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED';
type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'PRICE_DESC' | 'PRICE_ASC';

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

const filterBookings = (
  bookings: BookingHistoryItem[],
  status: FilterStatus,
  searchQuery: string
): BookingHistoryItem[] => {
  return bookings.filter((booking) => {
    const matchesStatus = status === 'ALL' || booking.status === status;
    const matchesSearch =
      searchQuery === '' ||
      booking.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.trip.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.trip.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });
};

const sortBookings = (
  bookings: BookingHistoryItem[],
  sortOption: SortOption
): BookingHistoryItem[] => {
  return [...bookings].sort((a, b) => {
    switch (sortOption) {
      case 'DATE_DESC':
        return new Date(b.trip.departureTime).getTime() - new Date(a.trip.departureTime).getTime();
      case 'DATE_ASC':
        return new Date(a.trip.departureTime).getTime() - new Date(b.trip.departureTime).getTime();
      case 'PRICE_DESC':
        return b.totalPaid - a.totalPaid;
      case 'PRICE_ASC':
        return a.totalPaid - b.totalPaid;
      default:
        return 0;
    }
  });
};

const BookingCard: React.FC<{
  booking: BookingHistoryItem;
  onDownloadTicket: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onChangeSeat: (bookingId: string) => void;
  isDownloading: boolean;
  isWorking: boolean;
}> = ({ booking, onDownloadTicket, onCancel, onChangeSeat, isDownloading, isWorking }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPast = new Date(booking.trip.departureTime) < new Date();

  return (
    <Card className="overflow-hidden">
      <div
        className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-lg ${
                isPast ? 'bg-gray-100' : 'bg-primary/10'
              }`}
            >
              <Ticket className={`h-7 w-7 ${isPast ? 'text-gray-400' : 'text-primary'}`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.trip.originCity} → {booking.trip.destinationCity}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
                {isPast && booking.status === 'CONFIRMED' && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    Completed
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                  Seats: {booking.seats.join(', ')}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Reference: {booking.referenceCode}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {booking.currency} {booking.totalPaid.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Paid</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-gray-50 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Trip Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Route</span>
                  <span className="font-medium">{booking.trip.routeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bus Type</span>
                  <span className="font-medium">{booking.trip.busType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">
                    {Math.floor(booking.trip.durationMinutes / 60)}h{' '}
                    {booking.trip.durationMinutes % 60}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Booked On</span>
                  <span className="font-medium">{formatDate(booking.bookedAt)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Actions</h4>
              <div className="space-y-2">
                {booking.status === 'CONFIRMED' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadTicket(booking.bookingId);
                    }}
                    disabled={isDownloading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? 'Downloading...' : 'Download Ticket'}
                  </Button>
                )}

                {booking.status !== 'CANCELLED' && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      disabled={isWorking}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeSeat(booking.bookingId);
                      }}
                    >
                      Change Seat
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      disabled={isWorking}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel(booking.bookingId);
                      }}
                    >
                      Cancel Booking
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export const UserBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('DATE_DESC');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchBookings = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }
      const data = await bookingService.getBookingHistory();
      setBookings(data);
    } catch (err) {
      setError('Failed to load your bookings. Please try again.');
      console.error(err);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
      setActionId(null);
    }
  }, []);

  useEffect(() => {
    fetchBookings(true);
  }, [fetchBookings]);

  const handleDownloadTicket = async (bookingId: string) => {
    try {
      setDownloadingId(bookingId);
      const blob = await bookingService.downloadTicket(bookingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download ticket:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Cancel this booking?')) return;

    setActionId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setActionId(null);
    }
  };

  const handleChangeSeat = async (bookingId: string) => {
    const seatCode = window.prompt('Enter new seat code');

    if (!seatCode) return;

    setActionId(bookingId);
    try {
      await bookingService.updateSeat(bookingId, seatCode.trim());
      await fetchBookings();
    } catch (err) {
      console.error('Failed to change seat:', err);
      setActionId(null);
    }
  };

  const filteredBookings = filterBookings(bookings, filterStatus, searchQuery);
  const sortedBookings = sortBookings(filteredBookings, sortOption);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">
          View and manage all your bus ticket bookings.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by reference, origin or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="DATE_DESC">Newest First</option>
                <option value="DATE_ASC">Oldest First</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="PRICE_ASC">Price: Low to High</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedBookings.length > 0 ? (
        <div className="space-y-4">
          {sortedBookings.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onDownloadTicket={handleDownloadTicket}
              onCancel={handleCancel}
              onChangeSeat={handleChangeSeat}
              isDownloading={downloadingId === booking.bookingId}
              isWorking={actionId === booking.bookingId}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {searchQuery || filterStatus !== 'ALL'
                ? 'No bookings found'
                : 'No bookings yet'}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || filterStatus !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't made any bookings yet. Start planning your next trip!"}
            </p>
            {!searchQuery && filterStatus === 'ALL' && (
              <Link to="/">
                <Button className="mt-6">
                  <Search className="mr-2 h-4 w-4" />
                  Search Trips
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {sortedBookings.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {sortedBookings.length} of {bookings.length} bookings
        </div>
      )}
    </div>
  );
};
