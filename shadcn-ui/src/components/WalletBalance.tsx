import { useWallet } from '@/contexts/WalletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletBalance() {
  const { balance, addFunds } = useWallet();

  const handleAddFunds = () => {
    addFunds(1000);
    toast.success('Added $1,000 to your balance!');
  };

  return (
    <Card className="bg-[#1C2128] border-[#2A2F36]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#00C853] p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[#8B949E] text-xs">Balance</p>
              <p className="text-white text-2xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
          <Button
            onClick={handleAddFunds}
            className="bg-[#00C853] hover:bg-[#00E676] text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Funds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}