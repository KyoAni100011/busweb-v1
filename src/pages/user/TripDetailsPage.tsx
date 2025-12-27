import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { publicTripService } from '@/services/publicTrip.service';
import type { TripSummary } from '@/types';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export const TripDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { trip, setTrip } = useBooking();
  const [details, setDetails] = useState<TripSummary>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isSubscribed = true;
    const loadTrip = async () => {
      if (!tripId) {
        return;
      }

      if (trip && trip.id === tripId) {
        setDetails(trip);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await publicTripService.getTripById(tripId);
        if (!isSubscribed) {
          return;
        }
        setTrip(response);
        setDetails(response);
      } catch (err: unknown) {
        if (!isSubscribed) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load trip');
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    loadTrip();

    return () => {
      isSubscribed = false;
    };
  }, [setTrip, trip, tripId]);

  if (!tripId) {
    return (
      <div className="rounded-xl border border-dashed border-primary/40 bg-white p-10 text-center text-muted-foreground">
        Missing trip identifier.
      </div>
    );
  }

  if (isLoading) {
    return <div className="rounded-xl border bg-white p-6 text-center">Loading trip details...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive">{error}</div>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary">Route</p>
              <h1 className="text-3xl font-bold text-gray-900">{details.routeName}</h1>
              <p className="text-muted-foreground">
                {details.originCity} → {details.destinationCity}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs uppercase text-primary">Departure</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateTime(details.departureTime)}</p>
              </div>
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs uppercase text-primary">Arrival</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateTime(details.arrivalTime)}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Duration: {Math.round(details.durationMinutes / 60)}h {details.durationMinutes % 60}m</p>
              <p>Bus type: {details.busType}</p>
              <p>Seats remaining: {details.availableSeats}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Amenities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {details.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl border bg-gray-50 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="text-3xl font-bold text-gray-900">
                {details.price.toLocaleString()} {details.currency}
              </p>
            </div>
            <Button size="lg" onClick={() => navigate(`/trip/${details.id}/select-seats`)}>
              Select seats
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to results
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Travel policies</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Ticket changes</h3>
            <p className="mt-2 text-sm text-muted-foreground">Changes are allowed up to 24 hours before departure, subject to availability.</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Cancellation policy</h3>
            <p className="mt-2 text-sm text-muted-foreground">Full refund if cancelled 48 hours before departure. Partial refund applies afterwards.</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">On-board services</h3>
            <p className="mt-2 text-sm text-muted-foreground">Complimentary water, onboard Wi-Fi, and charging ports are available on most buses.</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Support</h3>
            <p className="mt-2 text-sm text-muted-foreground">Need help? Call our hotline at 1900-1234 or email support@tempProject.vn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
