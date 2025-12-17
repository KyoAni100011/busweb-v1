import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '@/services/booking.service';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'PAID' | 'FAILED' | 'PENDING' | null>(
    null
  );

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
      .then((res: { status: 'PAID' | 'FAILED' | 'PENDING' }) => {
        setStatus(res.status);
      })
      .catch(() => setStatus('FAILED'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading || status === 'PENDING') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
        <p className="text-lg font-medium text-gray-700">Verifying payment…</p>
        <p className="text-sm text-muted-foreground">
          Please do not close this page
        </p>
      </div>
    );
  }

  if (status === 'PAID') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 bg-green-50 rounded-xl p-8">
        <CheckCircle className="w-16 h-16 text-green-600" />
        <h2 className="text-3xl font-bold text-green-700">
          Payment Successful
        </h2>
        <p className="text-gray-800 text-center text-sm">
          Your payment was successful.
        </p>
        <Button size="lg" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 bg-red-50 rounded-xl p-8">
      <XCircle className="w-16 h-16 text-red-600" />
      <h2 className="text-3xl font-bold text-red-700">Payment Failed</h2>
      <p className="text-gray-800 text-center text-sm">
        Your payment could not be processed.
      </p>
      <Button size="lg" onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </div>
  );
};
