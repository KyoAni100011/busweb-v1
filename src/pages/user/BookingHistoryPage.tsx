import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { bookingService } from '@/services/booking.service';
import type { BookingHistoryItem } from '@/types';

type StatusFilter = 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED';

const formatDate = (value: string) => new Date(value).toLocaleString();

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await bookingService.getBookingHistory();
      setBookings(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking history');
    } finally {
      setIsLoading(false);
      setActionId(null);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered = useMemo(() => {
    if (status === 'ALL') {
      return bookings;
    }

    return bookings.filter((item) => item.status === status);
  }, [bookings, status]);

  const handleDownloadTicket = async (bookingId: string, referenceCode: string) => {
    try {
      const blob = await bookingService.downloadTicket(bookingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${referenceCode}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download ticket');
    }
  };

  const handleCancel = async (bookingId: string) => {
    setActionId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId);
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to cancel booking');
      setActionId(null);
    }
  };

  const handleUpdateSeat = async (bookingId: string) => {
    const seatCode = window.prompt('Enter new seat code');
    if (!seatCode) return;
    setActionId(bookingId);
    try {
      await bookingService.updateSeat(bookingId, seatCode.trim());
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update seat');
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Booking history</h2>
          <p className="text-sm text-muted-foreground">Review your trips, statuses, and tickets.</p>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as StatusFilter[]).map((item) => (
            <Button
              key={item}
              variant={status === item ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border bg-white p-6 shadow-sm">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/30 bg-white p-10 text-center shadow-sm">
          <p className="text-base font-medium text-gray-900">No bookings yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Start a search to book your first trip.</p>
          <Button className="mt-4" onClick={() => window.location.assign('/')}>Search trips</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div key={booking.bookingId} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">{booking.status}</span>
                    <span className="text-sm text-muted-foreground">Ref: {booking.referenceCode}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{booking.trip.routeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.trip.originCity} → {booking.trip.destinationCity} · {formatDate(booking.trip.departureTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">Booked {formatDate(booking.bookedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(booking.totalPaid, booking.currency)}</p>
                  <p className="text-sm text-muted-foreground">Seats: {booking.seats.join(', ')}</p>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadTicket(booking.bookingId, booking.referenceCode)}>
                      Download ticket
                    </Button>
                    <Button variant="ghost" size="sm" disabled={actionId === booking.bookingId} onClick={() => handleUpdateSeat(booking.bookingId)}>
                      {actionId === booking.bookingId ? 'Updating…' : 'Change seat'}
                    </Button>
                    <Button variant="destructive" size="sm" disabled={actionId === booking.bookingId} onClick={() => handleCancel(booking.bookingId)}>
                      {actionId === booking.bookingId ? 'Cancelling…' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
