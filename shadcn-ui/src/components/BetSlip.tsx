import { useBetting } from '@/contexts/BettingContext';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function BetSlip() {
  const { betSlip, removeFromBetSlip, updateStake, placeBets, clearBetSlip } = useBetting();
  const { balance } = useWallet();

  const totalStake = betSlip.reduce((sum, item) => sum + item.stake, 0);
  const totalPotentialWin = betSlip.reduce((sum, item) => sum + item.stake * item.odds, 0);

  const handlePlaceBets = () => {
    if (totalStake > balance) {
      toast.error('Insufficient balance!');
      return;
    }

    const success = placeBets();
    if (success) {
      toast.success(`${betSlip.length} bet(s) placed successfully!`);
    } else {
      toast.error('Failed to place bets');
    }
  };

  if (betSlip.length === 0) {
    return (
      <Card className="bg-[#1C2128] border-[#2A2F36]">
        <CardHeader>
          <CardTitle className="text-white">Bet Slip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#8B949E] text-center py-8">No bets selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1C2128] border-[#2A2F36]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Bet Slip ({betSlip.length})</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearBetSlip}
          className="text-[#8B949E] hover:text-white"
        >
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {betSlip.map((item) => (
          <div key={item.game.id} className="bg-[#0F1419] p-3 rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {item.game.homeTeam} vs {item.game.awayTeam}
                </p>
                <p className="text-[#8B949E] text-xs">
                  {item.betType === 'home' ? item.game.homeTeam : item.betType === 'away' ? item.game.awayTeam : 'Draw'}
                </p>
                <p className="text-[#00C853] text-sm font-mono font-bold mt-1">
                  {item.odds.toFixed(2)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromBetSlip(item.game.id)}
                className="text-[#8B949E] hover:text-white p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8B949E] text-xs">Stake:</span>
              <Input
                type="number"
                min="10"
                step="10"
                value={item.stake}
                onChange={(e) => updateStake(item.game.id, Number(e.target.value))}
                className="bg-[#0F1419] border-[#2A2F36] text-white h-8"
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#8B949E]">Potential Win:</span>
              <span className="text-[#00C853] font-bold">
                ${(item.stake * item.odds).toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        <div className="border-t border-[#2A2F36] pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8B949E]">Total Stake:</span>
            <span className="text-white font-bold">${totalStake.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8B949E]">Potential Win:</span>
            <span className="text-[#00C853] font-bold">${totalPotentialWin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8B949E]">Balance:</span>
            <span className="text-white">${balance.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={handlePlaceBets}
          className="w-full bg-[#00C853] hover:bg-[#00E676] text-white font-bold"
          disabled={totalStake > balance}
        >
          Place Bet{betSlip.length > 1 ? 's' : ''}
        </Button>
      </CardContent>
    </Card>
  );
}