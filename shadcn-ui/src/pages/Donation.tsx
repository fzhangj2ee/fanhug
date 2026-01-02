import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Donation() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const presetAmounts = [5, 10, 25, 50, 100];

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid donation amount');
      return;
    }
    
    toast.success(`Thank you for your $${amount.toFixed(2)} donation! Payment integration coming soon.`);
  };

  return (
    <div className="min-h-screen bg-[#0d0f10]">
      <div className="py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="text-white hover:bg-[#1a1d1f] mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Heart className="h-10 w-10 text-red-500 fill-current" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Support Our Mission
              </CardTitle>
              <p className="text-[#b1bad3] text-lg">
                Help us make a difference for those affected by gambling
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mission Statement */}
              <div className="bg-[#0d0f10] rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Our Story</h3>
                <p className="text-[#b1bad3] leading-relaxed">
                  FanHug was created to provide a safe, play-money environment where people can enjoy the excitement of sports betting without the financial risks. We've seen too many lives affected by gambling addiction, and we're committed to offering an alternative that's fun, engaging, and completely risk-free.
                </p>
                <p className="text-[#b1bad3] leading-relaxed">
                  Your donation helps us maintain and improve this platform, develop educational resources about responsible gaming, and support organizations that help those struggling with gambling addiction.
                </p>
              </div>

              {/* Donation Amounts */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Choose Your Donation Amount</h3>
                
                {/* Preset Amounts */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                      className={`h-16 text-lg font-bold ${
                        selectedAmount === amount
                          ? 'bg-[#53d337] text-black hover:bg-[#45b82d]'
                          : 'bg-[#2a2d2f] text-white hover:bg-[#3a3d3f]'
                      }`}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Or enter a custom amount:</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1bad3] text-lg">
                      $
                    </span>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="0.00"
                      className="pl-8 bg-[#0d0f10] border-[#2a2d2f] text-white h-14 text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                className="w-full bg-[#53d337] hover:bg-[#45b82d] text-black font-bold py-6 text-lg"
              >
                <Heart className="h-5 w-5 mr-2 fill-current" />
                Donate Now
              </Button>

              {/* Additional Info */}
              <div className="bg-[#0d0f10] rounded-lg p-4">
                <p className="text-[#b1bad3] text-sm text-center">
                  All donations are used to maintain the platform and support gambling addiction prevention programs. 
                  Payment integration coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}