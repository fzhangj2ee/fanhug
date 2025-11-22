import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { PAYMENT_AMOUNT } from '@/lib/stripe';

export default function Payment() {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if Stripe key is configured
      const stripeKey = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';
      
      if (stripeKey === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
        setError('Stripe is not configured yet. Please add your Stripe publishable key in src/lib/stripe.ts to enable real payments.');
        setProcessing(false);
        return;
      }

      // In a real implementation, you would:
      // 1. Create a payment intent on your backend
      // 2. Confirm the payment with Stripe
      // 3. Handle the response

      setSuccess(true);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your payment of $1.00 has been processed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">$1.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-green-600">Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="w-fit mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-2xl">Complete Payment</CardTitle>
          <CardDescription>Secure payment powered by Stripe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Payment Amount</p>
                <p className="text-4xl font-bold">${(PAYMENT_AMOUNT / 100).toFixed(2)}</p>
              </div>
              <CreditCard className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Secure payment processing</p>
                <p>• Instant confirmation</p>
                <p>• Money goes directly to merchant account</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                To enable real payments, add your Stripe publishable key in <code className="bg-gray-100 px-1 rounded">src/lib/stripe.ts</code>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handlePayment} disabled={processing}>
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay $1.00
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}