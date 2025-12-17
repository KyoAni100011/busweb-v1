import { useEffect, useRef } from 'react';
import { publicTripService } from '@/services/publicTrip.service';
import type { SeatMapSeat } from '@/types';

interface SeatStatusUpdateOptions {
  tripId?: string;
  enabled?: boolean;
  pollIntervalMs?: number;
  immediate?: boolean;
  onUpdate: (seats: SeatMapSeat[]) => void;
}

export const useSeatStatusUpdates = ({
  tripId,
  enabled = true,
  pollIntervalMs = 5000,
  immediate = true,
  onUpdate,
}: SeatStatusUpdateOptions) => {
  const timerRef = useRef<number | undefined>(undefined);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !tripId) {
      return;
    }

    let isCancelled = false;

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };

    const scheduleNext = () => {
      clearTimer();
      if (!isCancelled && !document.hidden) {
        timerRef.current = window.setTimeout(fetchStatuses, pollIntervalMs);
      }
    };

    const fetchStatuses = async () => {
      if (isCancelled || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      try {
        const statuses = await publicTripService.refreshSeatStatuses(tripId);
        if (!isCancelled) {
          onUpdate(statuses);
        }
      } catch (error) {
      } finally {
        isFetchingRef.current = false;
        if (!isCancelled) {
          scheduleNext();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimer();
      } else {
        fetchStatuses();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (immediate && !document.hidden) {
      fetchStatuses();
    } else {
      scheduleNext();
    }

    return () => {
      isCancelled = true;
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, immediate, onUpdate, pollIntervalMs, tripId]);
};
