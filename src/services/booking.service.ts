import api from '@/lib/api';
import type {
  BookingConfirmation,
  BookingContactDetails,
  BookingHistoryItem,
  BookingQuote,
  GuestLookupRequest,
  GuestLookupResponse,
  PassengerFormValue,
} from '@/types';

interface CreateBookingPayload {
  tripId: string;
  seats: string[];
  passengers: PassengerFormValue[];
  contact: BookingContactDetails;
  isGuest?: boolean;
  holdToken?: string;
}

interface PrepareQuotePayload {
  tripId: string;
  seats: string[];
  passengers: PassengerFormValue[];
}

export const bookingService = {
  async prepareQuote(payload: PrepareQuotePayload): Promise<BookingQuote> {
    const response = await api.post<BookingQuote>('/public/bookings/quote', payload);

    return response.data;
  },

  async createBooking(payload: CreateBookingPayload): Promise<BookingConfirmation> {
    const response = await api.post<BookingConfirmation>('/public/bookings', payload);

    return response.data;
  },

  async getBookingHistory(): Promise<BookingHistoryItem[]> {
    const response = await api.get<BookingHistoryItem[]>('/user/bookings');

    return response.data;
  },

  async lookupGuestBooking(payload: GuestLookupRequest): Promise<GuestLookupResponse> {
    const response = await api.post<GuestLookupResponse>('/public/bookings/lookup', payload);

    return response.data;
  },

  async downloadTicket(bookingId: string): Promise<Blob> {
    const response = await api.get(`/public/bookings/${bookingId}/ticket`, {
      responseType: 'blob',
    });

    return response.data as Blob;
  },
};
