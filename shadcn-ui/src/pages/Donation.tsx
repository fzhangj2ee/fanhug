import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Donation() {
  const paypalLink = 'https://www.paypal.com/donate/?hosted_button_id=KQXJ5VXJJJ5XL';

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="h-6 w-6 fill-red-500 text-red-500" />
              Support FanHug
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-300 text-lg">
                FanHug is a passion project built to bring the excitement of sports betting to everyone, completely free. 
                Your support helps us keep the lights on and continue improving the platform.
              </p>

              {/* Monthly Cost Information */}
              <Card className="border-green-500/30 bg-gray-900/50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Monthly Operational Costs</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between items-center">
                      <span>Odds API:</span>
                      <span className="font-semibold text-green-500">$119/month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>MGX.dev tools subscription:</span>
                      <span className="font-semibold text-green-500">$200/month</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-green-500 text-lg">$319/month</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-4 italic">
                    Any donation helps us keep FanHug running and free for all users.
                  </p>
                </CardContent>
              </Card>

              <p className="text-gray-400">
                We're committed to keeping FanHug free and ad-free. If you enjoy using the platform and want to help 
                cover our server costs and API fees, any contribution is greatly appreciated!
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                onClick={() => window.open(paypalLink, '_blank')}
                className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-8 py-6 flex items-center gap-2"
              >
                <Heart className="h-5 w-5 fill-current" />
                Donate via PayPal
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <p className="text-gray-500 text-sm text-center">
                You'll be redirected to PayPal to complete your donation securely.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Why Donate?</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Keep FanHug completely free for everyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Support ongoing development and new features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Help cover API costs for real-time odds and scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Maintain reliable hosting and fast performance</span>
                </li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                Thank you for being part of the FanHug community! 🙏
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}