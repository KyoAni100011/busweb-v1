import api from '@/lib/api';
import type {
  BookingHistoryItem,
  BookingPayload,
  BookingQuote,
  GuestBookingPayload,
  GuestLookupRequest,
  GuestLookupResponse,
  PassengerFormValue,
} from '@/types';

interface PrepareQuotePayload {
  tripId: string;
  seats: string[];
  passengers: PassengerFormValue[];
}

export const bookingService = {
  async prepareQuote(payload: PrepareQuotePayload): Promise<BookingQuote> {
    const response = await api.post<BookingQuote>(
      '/public/bookings/quote',
      payload
    );

    return response.data;
  },

  async createBooking(payload: BookingPayload): Promise<any> {
    const response = await api.post<any>('/bookings', payload);

    return response.data;
  },

  async createGuestBooking(payload: GuestBookingPayload): Promise<any> {
    const response = await api.post<any>('/bookings/guest', payload);

    return response.data;
  },

  async getBookingHistory(): Promise<BookingHistoryItem[]> {
    const response = await api.get<BookingHistoryItem[]>('/user/bookings');

    return response.data;
  },

  async checkPaymentStatus(
    sessionId: string
  ): Promise<{ status: 'PAID' | 'FAILED' | 'PENDING'; booking?: any }> {
    const response = await api.get(`/payments/stripe/status`, {
      params: { sessionId },
    });
    return response.data;
  },

  async lookupGuestBooking(
    payload: GuestLookupRequest
  ): Promise<GuestLookupResponse> {
    const response = await api.post<GuestLookupResponse>(
      '/public/bookings/lookup',
      payload
    );

    return response.data;
  },

  async downloadTicket(bookingId: string): Promise<Blob> {
    const response = await api.get(`/public/bookings/${bookingId}/ticket`, {
      responseType: 'blob',
    });

    return response.data as Blob;
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await api.post(`/booking/${bookingId}/cancel`);
  },

  async updateSeat(bookingId: string, seatCode: string): Promise<void> {
    await api.patch(`/booking/${bookingId}/seats`, { seatCode });
  },
};
