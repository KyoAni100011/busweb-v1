import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { publicTripService } from '@/services/publicTrip.service';
import { bookingService } from '@/services/booking.service';
import { SeatMap } from '@/components/user/SeatMap';
import type { SeatMapSeat, SeatMapSnapshot, TripSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSeatStatusUpdates } from '@/lib/useSeatStatusUpdates';

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const SeatSelectionPage: React.FC = () => {
  const { tripId } = useParams();

  const [trip, setTrip] = useState<TripSummary>();
  const [seatMap, setSeatMap] = useState<SeatMapSnapshot>();
  const [selectedSeat, setSelectedSeat] = useState<SeatMapSeat | null>(null);

  const [paymentProvider, setPaymentProvider] = useState<'CASH' | 'STRIPE'>(
    'CASH'
  );

  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const [isLoading, setIsLoading] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [fatalError, setFatalError] = useState('');

  const previousSeatId = useRef<string | null>(null);

  const loadTripDetails = useCallback(async () => {
    if (!tripId) return;

    try {
      const res = await publicTripService.getTripById(tripId);
      setTrip(res);
    } catch (e: any) {
      setFatalError(e.message || 'Failed to load trip');
    }
  }, [tripId]);

  const loadSeatMap = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    try {
      const res = await publicTripService.getSeatMap(tripId);
      setSeatMap(res);
    } catch (e: any) {
      setFatalError(e.message || 'Failed to load seat map');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTripDetails();
  }, [loadTripDetails]);

  useEffect(() => {
    if (!seatMap || seatMap.tripId !== tripId) {
      loadSeatMap();
    }
  }, [loadSeatMap, seatMap, tripId]);

  const handleToggleSeat = useCallback(
    async (seat: SeatMapSeat) => {
      if (!tripId) return;

      if (seat.status !== 'AVAILABLE' && seat.id !== selectedSeat?.id) {
        setAlertMessage('Seat is no longer available');
        return;
      }

      try {
        if (selectedSeat?.id === seat.id) {
          setSelectedSeat(null);
          previousSeatId.current = null;
          await publicTripService.releaseSeats(tripId, [seat.id]);
          setHoldExpiresAt(null);
        } else {
          if (previousSeatId.current) {
            await publicTripService.releaseSeats(tripId, [
              previousSeatId.current,
            ]);
          }

          setIsHolding(true);
          const { expiresAt } = await publicTripService.holdSeats(
            tripId,
            [seat.id],
            [seat.seatNumber]
          );

          setSelectedSeat(seat);
          previousSeatId.current = seat.id;
          setHoldExpiresAt(expiresAt);
        }

        setAlertMessage('');
      } catch (e: any) {
        const statusCode = e?.response?.status;
        if (statusCode === 409) {
          setSeatMap((current) => {
            if (!current) return current;

            return {
              ...current,
              seats: current.seats.map((s) =>
                s.id === seat.id ? { ...s, status: 'BOOKED' } : s
              ),
              refreshedAt: new Date().toISOString(),
            };
          });

          setSelectedSeat((prev) =>
            prev?.id === seat.id ? null : prev
          );
          setAlertMessage('Seat has just been booked by someone else');
        } else {
          setAlertMessage(e.message || 'Failed to update seat');
        }
      } finally {
        setIsHolding(false);
      }
    },
    [selectedSeat, tripId]
  );

  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [holdExpiresAt]);

  const holdCountdown = useMemo(() => {
    if (!holdExpiresAt) return null;

    const remaining = new Date(holdExpiresAt).getTime() - now;
    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, [holdExpiresAt, now]);

  const applySeatStatuses = useCallback(
    (statuses: SeatMapSeat[]) => {
      if (!statuses) {
        return;
      }

      const availability = new Set(
        statuses
          .flatMap((seat) => [seat.id, seat.seatNumber])
          .filter(Boolean)
          .map((value) => value.toString().trim().toLowerCase())
      );

      const isAvailable = (seat: SeatMapSeat) => {
        const id = seat.id?.toString().trim().toLowerCase() ?? '';
        const code = seat.seatNumber?.toString().trim().toLowerCase() ?? '';
        return availability.has(id) || availability.has(code);
      };

      setSeatMap((current) => {
        if (!current) return current;

        const refreshedAt = new Date().toISOString();

        return {
          ...current,
          seats: current.seats.map((seat) => {
            const available = isAvailable(seat);
            const isSelected = selectedSeat?.id === seat.id;
            const nextStatus: SeatMapSeat['status'] = available || isSelected
              ? 'AVAILABLE'
              : seat.status === 'HELD'
                ? 'HELD'
                : 'BOOKED';

            return { ...seat, status: nextStatus };
          }),
          refreshedAt,
        };
      });
    },
    [selectedSeat]
  );

  useSeatStatusUpdates({
    tripId,
    enabled: Boolean(seatMap),
    pollIntervalMs: 5000,
    onUpdate: applySeatStatuses,
  });

  const handleCreateBooking = async () => {
    if (!tripId || !selectedSeat) return;

    try {
      const res = await bookingService.createBooking({
        tripId,
        seatCode: selectedSeat.seatNumber,
        paymentProvider,
      });

      if (res.payment?.checkoutUrl) {
        window.location.href = res.payment.checkoutUrl;
        return;
      }
    } catch (e: any) {
      setAlertMessage(e.message || 'Booking failed');
    }
  };

  if (!tripId) {
    return <div className="p-6 text-center">Missing trip identifier</div>;
  }

  if (fatalError) {
    return <div className="p-6 text-red-600">{fatalError}</div>;
  }

  if (isLoading && !seatMap) {
    return <div className="p-6 text-center">Loading seat map…</div>;
  }

  if (!trip || !seatMap) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold">Choose your seat</h2>
            <SeatMap
              map={seatMap}
              selectedSeatIds={selectedSeat ? [selectedSeat.id] : []}
              onToggleSeat={handleToggleSeat}
            />
          </div>

          <div className="rounded-xl border bg-gray-50 p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Trip summary</h3>
              <p>
                {trip.originCity} → {trip.destinationCity}
              </p>
              <p>{formatDateTime(trip.departureTime)}</p>
              <p>Duration {formatDuration(trip.durationMinutes)}</p>
            </div>

            <Separator />

            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>
                {selectedSeat
                  ? `${selectedSeat.price.toLocaleString()} ${selectedSeat.currency}`
                  : `0 ${trip.currency}`}
              </span>
            </div>

            {holdCountdown && (
              <p className="text-xs text-muted-foreground">
                Seat hold expires in {holdCountdown}
                {isHolding ? '…' : ''}
              </p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Phương thức thanh toán
              </label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={paymentProvider}
                onChange={(e) =>
                  setPaymentProvider(e.target.value as 'CASH' | 'STRIPE')
                }
              >
                <option value="CASH">Thanh toán tiền mặt</option>
                <option value="STRIPE">Thẻ / Stripe</option>
              </select>
            </div>

            {alertMessage && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
                {alertMessage}
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={!selectedSeat}
              onClick={handleCreateBooking}
            >
              Đặt vé
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
