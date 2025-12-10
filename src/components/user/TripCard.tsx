import React from 'react';
import type { TripSummary } from '@/types';
import { Button } from '@/components/ui/button';

interface TripCardProps {
  trip: TripSummary;
  onViewDetails: (trip: TripSummary) => void;
  onSelectSeats: (trip: TripSummary) => void;
}

const formatTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const TripCard: React.FC<TripCardProps> = ({ trip, onViewDetails, onSelectSeats }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">{trip.routeName}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{trip.originCity}</span>
            <span>→</span>
            <span>{trip.destinationCity}</span>
            <span>·</span>
            <span>{formatDate(trip.departureTime)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>
              <strong>{formatTime(trip.departureTime)}</strong> departure
            </span>
            <span>
              <strong>{formatTime(trip.arrivalTime)}</strong> arrival
            </span>
            <span>{Math.round(trip.durationMinutes / 60)}h {trip.durationMinutes % 60}m</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{trip.busType}</span>
            <span>·</span>
            <span>{trip.availableSeats} seats left</span>
            {trip.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">
                {amenity}
              </span>
            ))}
            {trip.amenities.length > 3 && <span>+{trip.amenities.length - 3} more</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold text-gray-900">
              {trip.price.toLocaleString()} {trip.currency}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Button variant="outline" onClick={() => onViewDetails(trip)}>
              View details
            </Button>
            <Button onClick={() => onSelectSeats(trip)}>Select seats</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
