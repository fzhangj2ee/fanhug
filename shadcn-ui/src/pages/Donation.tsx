import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

const PAYPAL_DONATION_LINK = 'https://www.paypal.com/donate/?business=GDERQZQ5Y7XDL&no_recurring=0&item_name=FanHug+offers+safe+play-money+sports+betting%2C+fun+and+risk-free%2C+while+supporting+responsible+gaming+and+addiction+recovery.%0A&currency_code=USD';

export default function Donation() {
  const [message, setMessage] = useState('');

  const handleDonate = () => {
    // Open PayPal donation link in a new tab
    window.open(PAYPAL_DONATION_LINK, '_blank', 'noopener,noreferrer');
    
    // Show confirmation toast
    toast.success('Redirecting to PayPal for donation. Thank you for your support!');
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-8 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-gray-900 border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Heart className="h-16 w-16 fill-red-500 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Support Our Mission</h1>
            <p className="text-gray-400 text-lg">
              Your donation helps us maintain and improve FanHug, providing a safe and fun
              play-money sports betting experience while supporting responsible gaming and
              addiction recovery initiatives.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Leave a Message (Optional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share why you're supporting FanHug..."
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleDonate}
              className="w-full bg-[#0070BA] hover:bg-[#005EA6] text-white font-bold py-6 text-lg transition-colors"
            >
              Donate with PayPal
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>You will be redirected to PayPal to complete your donation securely.</p>
              <p className="mt-2">Thank you for supporting responsible gaming! ❤️</p>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            FanHug is committed to promoting responsible gaming and supporting addiction
            recovery programs.
          </p>
          <p className="mt-2">All donations are processed securely through PayPal.</p>
        </div>
      </div>
    </div>
  );
}