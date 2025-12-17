import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-semibold">Payment cancelled</h2>
      <p className="text-sm text-muted-foreground">
        You have cancelled the payment.
      </p>

      <div className="flex gap-3">
        {bookingId && (
          <Button
            variant="outline"
            onClick={() => navigate(`/trip/${bookingId}`)}
          >
            Try again
          </Button>
        )}
        <Button onClick={() => navigate('/')}>Back to home</Button>
      </div>
    </div>
  );
}
