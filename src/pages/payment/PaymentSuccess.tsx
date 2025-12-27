import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import domtoimage from 'dom-to-image-more';

import { bookingService } from '@/services/booking.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Loader2, CheckCircle, XCircle, Download, Home } from 'lucide-react';

type PaymentBooking = {
  bookingId: string;
  bookingCode: string;
  referenceCode: string;
  totalAmount: number;
  currency: string;
  seats: string[];
  issuedAt?: string;
  route?: { originCity: string; destinationCity: string };
  trip?: { departureTime: string; arrivalTime: string; routeName?: string };
  bus?: { plateNumber?: string; busType?: string };
  ticketUrl?: string;
};

const MOCK_BOOKING: PaymentBooking = {
  bookingId: '#BK123456',
  bookingCode: 'BK-DEMO',
  referenceCode: 'BK-DEMO',
  totalAmount: 0,
  currency: 'VND',
  seats: ['A1', 'A2'],
  route: { originCity: 'Origin', destinationCity: 'Destination' },
  trip: {
    departureTime: '2025-12-17T19:30:00Z',
    arrivalTime: '2025-12-17T23:30:00Z',
    routeName: 'Origin → Destination',
  },
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div style={{ marginBottom: 12 }}>
    <div
      style={{
        fontSize: 10,
        lineHeight: '12px',
        color: '#9ca3af',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </div>
  </div>
);

const TicketExport = ({ booking }: { booking: PaymentBooking }) => {
  return (
    <div
      style={{
        width: 380,
        padding: 24,
        background: '#fff',
        border: '2px solid #e5e7eb',
        borderRadius: 16,
        fontFamily: 'Arial',
        color: '#111827',
        boxSizing: 'border-box',
        letterSpacing: '0px',
        WebkitFontSmoothing: 'antialiased',
        textRendering: 'geometricPrecision',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            lineHeight: '14px',
            fontWeight: 600,
            color: '#6b7280',
            whiteSpace: 'nowrap',
          }}
        >
          BUS TICKET
        </div>

        <div
          style={{
            fontSize: 20,
            lineHeight: '26px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            marginTop: 4,
          }}
        >
          {booking.trip?.routeName ?? `${booking.route?.originCity} → ${booking.route?.destinationCity}`}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: '18px',
            color: '#6b7280',
            whiteSpace: 'nowrap',
          }}
        >
          {booking.bus?.busType || 'Bus'} • {booking.bus?.plateNumber || '—'}
        </div>
      </div>

      <div style={{ height: 1, background: '#e5e7eb', margin: '16px 0' }} />

      <Row label="DATE" value={new Date(booking.trip?.departureTime || '').toLocaleDateString()} />
      <Row label="TIME" value={new Date(booking.trip?.departureTime || '').toLocaleTimeString()} />
      <Row label="ARRIVAL" value={new Date(booking.trip?.arrivalTime || '').toLocaleTimeString()} />
      <Row label="SEATS" value={booking.seats.join(', ')} />

      <div style={{ height: 1, background: '#e5e7eb', margin: '16px 0' }} />

      <div
        style={{
          fontSize: 12,
          lineHeight: '16px',
          whiteSpace: 'nowrap',
        }}
      >
        Booking ID: <span style={{ fontWeight: 700 }}>{booking.bookingCode}</span>
      </div>
    </div>
  );
};

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'PAID' | 'FAILED' | 'PENDING' | null>(
    null
  );
  const [bookingData, setBookingData] = useState<PaymentBooking | null>(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      'session_id'
    );

    if (!sessionId) {
      navigate('/');
      return;
    }

    bookingService
      .checkPaymentStatus(sessionId)
      .then((res: { status: any; booking?: PaymentBooking }) => {
        setStatus(res.status);
        if (res.status === 'PAID' && res.booking) {
          setBookingData(res.booking);
        }
      })
      .catch(() => setStatus('FAILED'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const safeBooking = bookingData ?? MOCK_BOOKING;

  const downloadTicket = async () => {
    try {
      if (bookingData?.bookingId) {
        const blob = await bookingService.downloadTicket(bookingData.bookingId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `ticket-${bookingData.bookingCode}.html`;
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
        return;
      }

      if (!ticketRef.current) return;
      await document.fonts.ready;
      const dataUrl = await domtoimage.toPng(ticketRef.current, {
        pixelRatio: 3,
        bgcolor: '#ffffff',
        cacheBust: true,
        style: { transform: 'none' },
      });

      const link = document.createElement('a');
      link.download = `ticket-${safeBooking.bookingCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export ticket failed:', err);
    }
  };

  if (loading || status === 'PENDING') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
        <p className="text-lg font-medium">Verifying payment…</p>
      </div>
    );
  }

  if (status === 'PAID') {
    return (
      <div className="flex flex-col items-center space-y-6 p-4">
        <CheckCircle className="w-16 h-16 text-green-600" />
        <h2 className="text-3xl font-bold text-green-700">
          Payment Successful
        </h2>

        <Card className="w-full max-w-md border-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-bold">{safeBooking.trip?.routeName ?? `${safeBooking.route?.originCity} → ${safeBooking.route?.destinationCity}`}</h3>
            <p className="text-sm text-muted-foreground">
              {safeBooking.bus?.busType} • {safeBooking.bus?.plateNumber}
            </p>
            <Separator />
            <p>Date: {safeBooking.trip?.departureTime ? new Date(safeBooking.trip.departureTime).toLocaleDateString() : '—'}</p>
            <p>Departure: {safeBooking.trip?.departureTime ? new Date(safeBooking.trip.departureTime).toLocaleTimeString() : '—'}</p>
            <p>Arrival: {safeBooking.trip?.arrivalTime ? new Date(safeBooking.trip.arrivalTime).toLocaleTimeString() : '—'}</p>
            <p>Seats: {safeBooking.seats.join(', ')}</p>
            <Separator />
            <p className="font-mono font-semibold">{safeBooking.bookingCode}</p>
          </CardContent>
        </Card>

        <div
          style={{
            position: 'fixed',
            top: '-9999px',
            left: '-9999px',
          }}
        >
          <div ref={ticketRef}>
            <TicketExport booking={safeBooking} />
          </div>
        </div>

        <div className="flex w-full max-w-md gap-3">
          <Button onClick={downloadTicket} className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            Download Ticket
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1 gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
      <XCircle className="w-16 h-16 text-red-600" />
      <h2 className="text-3xl font-bold text-red-700">Payment Failed</h2>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );
};
