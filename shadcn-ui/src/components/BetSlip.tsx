import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function BetSlip() {
  const { betSlip, removeBet, clearBetSlip, placeBet } = useBetting();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});

  const handleAmountChange = (betId: string, value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBetAmounts((prev) => ({ ...prev, [betId]: value }));
    }
  };

  const calculatePotentialWin = (odds: number, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    if (odds > 0) {
      return ((odds / 100) * numAmount).toFixed(2);
    } else {
      return ((100 / Math.abs(odds)) * numAmount).toFixed(2);
    }
  };

  const getTotalStake = () => {
    return betSlip
      .reduce((sum, bet) => {
        const amount = parseFloat(betAmounts[bet.id] || '0');
        return sum + amount;
      }, 0)
      .toFixed(2);
  };

  const getTotalPotentialWin = () => {
    return betSlip
      .reduce((sum, bet) => {
        const amount = parseFloat(betAmounts[bet.id] || '0');
        const win = parseFloat(calculatePotentialWin(bet.odds, betAmounts[bet.id] || '0'));
        return sum + win;
      }, 0)
      .toFixed(2);
  };

  const handlePlaceBets = () => {
    if (!user) {
      toast.error('Please login to place bets');
      return;
    }

    const betsWithAmounts = betSlip.map((bet) => ({
      ...bet,
      amount: parseFloat(betAmounts[bet.id] || '0'),
    }));

    const invalidBets = betsWithAmounts.filter((bet) => bet.amount <= 0);
    if (invalidBets.length > 0) {
      toast.error('Please enter valid amounts for all bets');
      return;
    }

    betsWithAmounts.forEach((bet) => {
      placeBet(bet.gameId, bet.betType, bet.team, bet.odds, bet.amount);
    });

    setBetAmounts({});
    clearBetSlip();
    toast.success(`${betsWithAmounts.length} bet(s) placed successfully!`);
  };

  if (betSlip.length === 0) {
    return (
      <Card className="w-full border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Bet Slip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">Your bet slip is empty</p>
            <p className="text-sm text-gray-500 mt-2">Add bets to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if user is not logged in
  if (!user) {
    return (
      <Card className="w-full border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Bet Slip ({betSlip.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show bet slip items but disabled */}
          {betSlip.map((bet) => (
            <div key={bet.id} className="p-3 rounded-lg bg-gray-700/30 border border-gray-600 opacity-60">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-white font-medium">{bet.team}</p>
                  <p className="text-sm text-gray-400">{bet.betType}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBet(bet.id)}
                  className="h-6 w-6 p-0 hover:bg-gray-600"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Odds:</span>
                <span className="text-white font-semibold">{bet.odds > 0 ? '+' : ''}{bet.odds}</span>
              </div>
            </div>
          ))}

          <Separator className="bg-gray-700" />

          {/* Login Required Message */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-500 font-medium mb-1">Login Required</p>
                <p className="text-sm text-gray-300 mb-3">
                  Please login to place bets and track your betting history
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Login to Place Bets
                </Button>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={clearBetSlip}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Clear Bet Slip
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User is logged in - show full functionality
  return (
    <Card className="w-full border-gray-700 bg-gray-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Bet Slip ({betSlip.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {betSlip.map((bet) => (
          <div key={bet.id} className="p-3 rounded-lg bg-gray-700/30 border border-gray-600">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-white font-medium">{bet.team}</p>
                <p className="text-sm text-gray-400">{bet.betType}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBet(bet.id)}
                className="h-6 w-6 p-0 hover:bg-gray-600"
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">Odds:</span>
              <span className="text-white font-semibold">
                {bet.odds > 0 ? '+' : ''}
                {bet.odds}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`amount-${bet.id}`} className="text-gray-300 text-sm">
                Bet Amount ($)
              </Label>
              <Input
                id={`amount-${bet.id}`}
                type="text"
                placeholder="0.00"
                value={betAmounts[bet.id] || ''}
                onChange={(e) => handleAmountChange(bet.id, e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              {betAmounts[bet.id] && parseFloat(betAmounts[bet.id]) > 0 && (
                <p className="text-xs text-green-400">
                  Potential Win: ${calculatePotentialWin(bet.odds, betAmounts[bet.id])}
                </p>
              )}
            </div>
          </div>
        ))}

        <Separator className="bg-gray-700" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Stake:</span>
            <span className="text-white font-semibold">${getTotalStake()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Potential Win:</span>
            <span className="text-green-400 font-semibold">${getTotalPotentialWin()}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={handlePlaceBets}
            disabled={parseFloat(getTotalStake()) <= 0}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Bet{betSlip.length > 1 ? 's' : ''} (${getTotalStake()})
          </Button>
          <Button
            variant="outline"
            onClick={clearBetSlip}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Clear Bet Slip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}