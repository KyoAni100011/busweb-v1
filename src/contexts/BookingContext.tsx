import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
  BookingContactDetails,
  PassengerFormValue,
  SeatMapSeat,
  SeatMapSnapshot,
  TripSummary,
} from '@/types';

interface BookingContextValue {
  trip?: TripSummary;
  seatMap?: SeatMapSnapshot;
  selectedSeats: SeatMapSeat[];
  passengers: PassengerFormValue[];
  contact: BookingContactDetails | null;
  holdToken?: string | null;
  holdExpiresAt?: string | null;
  setTrip: (trip?: TripSummary) => void;
  setSeatMap: React.Dispatch<React.SetStateAction<SeatMapSnapshot | undefined>>;
  addSeat: (seat: SeatMapSeat) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  setPassengers: (values: PassengerFormValue[]) => void;
  setContact: (details: BookingContactDetails | null) => void;
  setHoldInfo: (token: string | null, expiresAt?: string | null) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trip, setTrip] = useState<TripSummary>();
  const [seatMap, setSeatMap] = useState<SeatMapSnapshot>();
  const [selectedSeats, setSelectedSeats] = useState<SeatMapSeat[]>([]);
  const [passengers, setPassengers] = useState<PassengerFormValue[]>([]);
  const [contact, setContact] = useState<BookingContactDetails | null>(null);
  const [holdToken, setHoldToken] = useState<string | null>();
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>();

  const addSeat = useCallback((seat: SeatMapSeat) => {
    setSelectedSeats((prev) => {
      if (prev.some((item) => item.id === seat.id)) {
        return prev;
      }

      return [...prev, seat];
    });
  }, []);

  const removeSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) => prev.filter((seat) => seat.id !== seatId));
    setPassengers((prev) => prev.filter((passenger) => passenger.seatId !== seatId));
  }, []);

  const clearSeats = useCallback(() => {
    setSelectedSeats([]);
    setPassengers([]);
    setHoldToken(null);
    setHoldExpiresAt(null);
  }, []);

  const setHoldInfo = useCallback((token: string | null, expiresAt?: string | null) => {
    setHoldToken(token);
    setHoldExpiresAt(expiresAt ?? null);
  }, []);

  const reset = useCallback(() => {
    setTrip(undefined);
    setSeatMap(undefined);
    clearSeats();
    setContact(null);
  }, [clearSeats]);

  const value = useMemo<BookingContextValue>(() => ({
    trip,
    seatMap,
    selectedSeats,
    passengers,
    contact,
    holdToken,
    holdExpiresAt,
    setTrip,
    setSeatMap,
    addSeat,
    removeSeat,
    clearSeats,
    setPassengers,
    setContact,
    setHoldInfo,
    reset,
  }), [
    contact,
    holdExpiresAt,
    holdToken,
    passengers,
    reset,
    seatMap,
    selectedSeats,
    trip,
    addSeat,
    removeSeat,
    clearSeats,
    setPassengers,
    setContact,
    setSeatMap,
    setTrip,
    setHoldInfo,
  ]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }

  return context;
};
