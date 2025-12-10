import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { publicTripService } from '@/services/publicTrip.service';
import { SeatMap } from '@/components/user/SeatMap';
import type { SeatMapSeat } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSeatStatusUpdates } from '@/lib/useSeatStatusUpdates';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

export const SeatSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const {
    trip,
    seatMap,
    selectedSeats,
    setTrip,
    setSeatMap,
    addSeat,
    removeSeat,
    clearSeats,
    setPassengers,
    setContact,
    holdExpiresAt,
    setHoldInfo,
  } = useBooking();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fatalError, setFatalError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [now, setNow] = useState(Date.now());
  const previousSelectionKey = useRef('');
  const [guestContact, setGuestContact] = useState({ fullName: '', phone: '', email: '' });
  const [guestPassengers, setGuestPassengers] = useState<SeatMapSeat[]>([]);

  const selectedSeatIds = useMemo(() => selectedSeats.map((seat) => seat.id), [selectedSeats]);
  const selectionKey = useMemo(() => selectedSeatIds.slice().sort().join(','), [selectedSeatIds]);
  const selectionTotal = useMemo(
    () => selectedSeats.reduce((total, seat) => total + seat.price, 0),
    [selectedSeats]
  );

  const isGuestFormValid = useMemo(() => {
    if (isAuthenticated || !selectedSeats.length) {
      return true;
    }

    const hasContact = guestContact.fullName.trim() && guestContact.email.trim() && guestContact.phone.trim();
    const hasPassengers = guestPassengers.length === selectedSeats.length;

    return Boolean(hasContact && hasPassengers);
  }, [guestContact.email, guestContact.fullName, guestContact.phone, guestPassengers.length, isAuthenticated, selectedSeats.length]);

  const loadTripDetails = useCallback(async () => {
    if (!tripId) {
      return;
    }

    if (trip && trip.id === tripId) {
      return;
    }

    setFatalError('');

    try {
      const response = await publicTripService.getTripById(tripId);
      setTrip(response);
    } catch (err: unknown) {
      setFatalError(err instanceof Error ? err.message : 'Failed to load trip information');
    }
  }, [setTrip, trip, tripId]);

  const loadSeatMap = useCallback(async () => {
    if (!tripId) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await publicTripService.getSeatMap(tripId);
      setSeatMap(response);
    } catch (err: unknown) {
      setFatalError(err instanceof Error ? err.message : 'Failed to load seat map');
    } finally {
      setIsLoading(false);
    }
  }, [setSeatMap, tripId]);

  const handleToggleSeat = useCallback(
    async (seat: SeatMapSeat) => {
      if (!tripId) {
        return;
      }

      if (seat.status !== 'AVAILABLE' && !selectedSeatIds.includes(seat.id)) {
        setAlertMessage('Seat is no longer available.');

        return;
      }

      const isSelected = selectedSeatIds.includes(seat.id);

      try {
        if (isSelected) {
          removeSeat(seat.id);
          await publicTripService.releaseSeats(tripId, [seat.id]);
        } else {
          addSeat(seat);
        }
        setAlertMessage('');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to update seat selection';
        setAlertMessage(message);
      }
    },
    [addSeat, removeSeat, selectedSeatIds, tripId]
  );

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    setGuestPassengers((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      return selectedSeats.map((seat) => map.get(seat.id) ?? seat);
    });
  }, [isAuthenticated, selectedSeats]);

  useEffect(() => {
    loadTripDetails();
  }, [loadTripDetails]);

  useEffect(() => {
    if (!seatMap || seatMap.tripId !== tripId) {
      loadSeatMap();
    }
  }, [loadSeatMap, seatMap, tripId]);

  useEffect(() => {
    if (!tripId) {
      return;
    }

    if (!selectionKey) {
      previousSelectionKey.current = '';
      setHoldInfo(null);

      return;
    }

    if (selectionKey === previousSelectionKey.current) {
      return;
    }

    let isCancelled = false;

    const holdSeats = async () => {
      setIsHolding(true);

      try {
        const seatCodes = selectedSeats.map((seat) => seat.seatNumber || seat.id);
        const { expiresAt } = await publicTripService.holdSeats(tripId, selectedSeatIds, seatCodes);
        if (isCancelled) {
          return;
        }

        setHoldInfo(null, expiresAt);
        previousSelectionKey.current = selectionKey;
        setAlertMessage('');
      } catch (err: unknown) {
        if (!isCancelled) {
          setAlertMessage(err instanceof Error ? err.message : 'Failed to hold selected seats');
        }
      } finally {
        if (!isCancelled) {
          setIsHolding(false);
        }
      }
    };

    holdSeats();

    return () => {
      isCancelled = true;
    };
  }, [selectedSeatIds, selectionKey, setHoldInfo, tripId]);

  useEffect(() => {
    if (!holdExpiresAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [holdExpiresAt]);

  useEffect(() => {
    if (!tripId || !holdExpiresAt || !selectedSeatIds.length) {
      return;
    }

    const expiry = new Date(holdExpiresAt).getTime();
    if (Number.isNaN(expiry)) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        await publicTripService.releaseSeats(tripId, selectedSeatIds);
      } catch (err) {
        console.error('Failed to release seats after hold expired', err);
      } finally {
        clearSeats();
        setAlertMessage('Seat hold expired. Please reselect your seats.');
      }
    }, Math.max(expiry - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [clearSeats, holdExpiresAt, selectedSeatIds, tripId]);

  const applySeatStatuses = useCallback((statuses: SeatMapSeat[]) => {
    setSeatMap((current) => {
      if (!current) {
        return current;
      }

      if (!statuses.length) {
        return {
          ...current,
          refreshedAt: new Date().toISOString(),
        };
      }

      const statusMap = new Map(statuses.map((seat) => [seat.id, seat]));
      let didChange = false;

      const seats = current.seats.map((seat) => {
        const updated = statusMap.get(seat.id);
        if (!updated) {
          return seat;
        }

        if (
          updated.status === seat.status &&
          updated.price === seat.price &&
          updated.currency === seat.currency
        ) {
          return seat;
        }

        didChange = true;

        return {
          ...seat,
          status: updated.status,
          price: updated.price,
          currency: updated.currency,
        };
      });

      if (!didChange) {
        return {
          ...current,
          refreshedAt: new Date().toISOString(),
        };
      }

      return {
        ...current,
        seats,
        refreshedAt: new Date().toISOString(),
      };
    });
  }, [setSeatMap]);

  useSeatStatusUpdates({
    tripId,
    enabled: Boolean(seatMap),
    pollIntervalMs: 5000,
    onUpdate: applySeatStatuses,
  });

  useEffect(() => {
    return () => {
      if (!tripId || !selectedSeatIds.length) {
        return;
      }

      publicTripService
        .releaseSeats(tripId, selectedSeatIds)
        .catch((err) => console.error('Failed to release seats on exit', err));
      clearSeats();
    };
  }, [clearSeats, selectedSeatIds, tripId]);

  const handleSaveGuestDetails = () => {
    if (!selectedSeats.length) {
      setAlertMessage('Please select at least one seat.');
      return;
    }

    if (!isAuthenticated) {
      const passengersForBooking = guestPassengers.map((seat) => ({
        seatId: seat.id,
        fullName: guestContact.fullName,
        phone: guestContact.phone,
        email: guestContact.email,
        documentId: undefined,
      }));

      setPassengers(passengersForBooking);
      setContact({
        fullName: guestContact.fullName,
        phone: guestContact.phone,
        email: guestContact.email,
      });

      setAlertMessage('Guest details saved for checkout.');
    } else {
      setAlertMessage('Passenger details step is not yet implemented. Seats are held.');
    }
  };

  const holdCountdown = useMemo(() => {
    if (!holdExpiresAt) {
      return null;
    }

    const remaining = new Date(holdExpiresAt).getTime() - now;
    if (remaining <= 0) {
      return 'Expired';
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [holdExpiresAt, now]);

  if (!tripId) {
    return (
      <div className="rounded-xl border border-dashed border-primary/40 bg-white p-10 text-center text-muted-foreground">
        Missing trip identifier.
      </div>
    );
  }

  if (isLoading && !seatMap) {
    return <div className="rounded-xl border bg-white p-6 text-center">Loading seat map...</div>;
  }

  if (fatalError) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive">{fatalError}</div>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  if (!seatMap || !trip) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
        <p className="text-sm text-muted-foreground">Updated {new Date(seatMap.refreshedAt).toLocaleTimeString()}</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Choose your seats</h2>
              <p className="text-sm text-muted-foreground">Select the seats you want to book. Held and booked seats are disabled.</p>
            </div>
            <SeatMap map={seatMap} selectedSeatIds={selectedSeatIds} onToggleSeat={handleToggleSeat} />
          </div>

          <div className="rounded-xl border bg-gray-50 p-5">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trip summary</h3>
                <p className="text-sm text-muted-foreground">
                  {trip.originCity} → {trip.destinationCity}
                </p>
                <p className="text-sm text-muted-foreground">{formatDateTime(trip.departureTime)}</p>
                <p className="text-sm text-muted-foreground">Duration {formatDuration(trip.durationMinutes)}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-900">Selected seats</h3>
                {selectedSeats.length ? (
                  <ul className="mt-3 space-y-2 text-sm">
                    {selectedSeats.map((seat) => (
                      <li key={seat.id} className="flex items-center justify-between">
                        <span>
                          Seat {seat.seatNumber}
                          <span className="ml-2 text-muted-foreground">{seat.type}</span>
                        </span>
                        <span>
                          {seat.price.toLocaleString()} {seat.currency}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No seats selected yet.</p>
                )}
              </div>

              {alertMessage && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
                  {alertMessage}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                  <span>Total</span>
                  <span>
                    {selectionTotal.toLocaleString()} {trip.currency}
                  </span>
                </div>
                {holdCountdown && (
                  <p className="text-xs text-muted-foreground">Seat hold expires in {holdCountdown}{isHolding ? '…' : ''}</p>
                )}
              </div>

              <div className="space-y-4">
                {!isAuthenticated && selectedSeats.length > 0 && (
                  <div className="space-y-3 rounded-lg border bg-white p-3 text-sm">
                    <p className="font-semibold text-gray-900">Guest details</p>
                    <div className="grid gap-3">
                      <div className="grid gap-1">
                        <Label htmlFor="guest-name">Full name</Label>
                        <Input
                          id="guest-name"
                          value={guestContact.fullName}
                          onChange={(e) => setGuestContact((c) => ({ ...c, fullName: e.target.value }))}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="guest-email">Email</Label>
                        <Input
                          id="guest-email"
                          type="email"
                          value={guestContact.email}
                          onChange={(e) => setGuestContact((c) => ({ ...c, email: e.target.value }))}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="guest-phone">Phone</Label>
                        <Input
                          id="guest-phone"
                          value={guestContact.phone}
                          onChange={(e) => setGuestContact((c) => ({ ...c, phone: e.target.value }))}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Passengers</Label>
                        <div className="space-y-2 rounded-md border bg-gray-50 p-2">
                          {guestPassengers.map((seat) => (
                            <div key={seat.id} className="flex items-center justify-between text-xs text-gray-700">
                              <span>Seat {seat.seatNumber}</span>
                              <span>{guestContact.fullName || 'Pending name'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  disabled={!selectedSeats.length || (!isAuthenticated && !isGuestFormValid)}
                  onClick={handleSaveGuestDetails}
                >
                  {isAuthenticated ? 'Continue to passenger details' : 'Save guest details'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
