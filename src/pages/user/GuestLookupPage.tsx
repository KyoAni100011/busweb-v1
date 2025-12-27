import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bookingService } from '@/services/booking.service';
import type { BookingConfirmation } from '@/types';

const formatDate = (value: string) => new Date(value).toLocaleString();

export const GuestLookupPage: React.FC = () => {
  const [referenceCode, setReferenceCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<BookingConfirmation | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!referenceCode.trim()) {
      setError('Reference code is required.');
      return;
    }

    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      const response = await bookingService.lookupGuestBooking({
        referenceCode: referenceCode.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (response.booking) {
        setResult(response.booking);
      } else {
        setError('No booking found with those details.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!result) return;

    try {
      const blob = await bookingService.downloadTicket(result.bookingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${result.referenceCode}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Guest booking lookup</h2>
        <p className="text-sm text-muted-foreground">Retrieve your booking using reference code plus email or phone.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm text-muted-foreground" htmlFor="referenceCode">
              Reference code *
            </label>
            <Input
              id="referenceCode"
              placeholder="e.g. ABC123"
              value={referenceCode}
              onChange={(event) => setReferenceCode(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted-foreground" htmlFor="email">
              Email (optional)
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted-foreground" htmlFor="phone">
              Phone (optional)
            </label>
            <Input
              id="phone"
              placeholder="e.g. 0901 234 567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
        </div>
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Lookup booking'}
        </Button>
      </form>

      {result && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">{result.status}</span>
                <span className="text-sm text-muted-foreground">Ref: {result.referenceCode}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{result.trip.routeName}</p>
              <p className="text-sm text-muted-foreground">
                {result.trip.originCity} → {result.trip.destinationCity} · {formatDate(result.trip.departureTime)}
              </p>
              <p className="text-sm text-muted-foreground">Issued {formatDate(result.issuedAt)}</p>
              <p className="text-sm text-muted-foreground">Seats: {result.seats.join(', ')}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadTicket}>
                Download ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
