import { useBetting } from '@/contexts/BettingContext';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PlayMoney from '@/components/PlayMoney';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BetSlip() {
  const { bets, removeBet, clearBets, placeBets } = useBetting();
  const { balance, deductBalance } = useWallet();
  const [stake, setStake] = useState<string>('10');

  const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
  const potentialPayout = parseFloat(stake || '0') * totalOdds;

  const handlePlaceBets = async () => {
    const stakeAmount = parseFloat(stake);
    
    if (!stakeAmount || stakeAmount <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    if (stakeAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (bets.length === 0) {
      toast.error('Please add at least one bet');
      return;
    }

    try {
      // Deduct balance immediately when placing bets
      await deductBalance(stakeAmount);
      
      // Place all bets
      await placeBets(stakeAmount);
      
      toast.success(`${bets.length} bet(s) placed successfully!`);
      setStake('10');
    } catch (error) {
      console.error('Error placing bets:', error);
      toast.error('Failed to place bets');
    }
  };

  const formatGameTime = (commenceTime: string) => {
    const date = new Date(commenceTime);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) {
      return 'Live';
    } else if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Sort bets by game start time (soonest first)
  const sortedBets = [...bets].sort((a, b) => {
    const timeA = new Date(a.game.commence_time).getTime();
    const timeB = new Date(b.game.commence_time).getTime();
    return timeA - timeB;
  });

  return (
    <div className="sticky top-24 bg-gray-900 rounded-lg border border-gray-800 p-4">
      {/* Fixed Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          BET SLIP ({bets.length})
        </h2>
        {bets.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearBets}
            className="text-gray-400 hover:text-white"
          >
            Clear All
          </Button>
        )}
      </div>

      {bets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">YOUR PICKS WILL SHOW UP HERE.</p>
          <p className="text-gray-500 text-sm mt-2">
            Select picks to then see the different types of bets available, including Singles, Parlays, Teasers, Round Robins and more.
          </p>
        </div>
      ) : (
        <>
          {/* Scrollable Bets List */}
          <ScrollArea className="h-[calc(100vh-400px)] pr-4">
            <div className="space-y-3">
              {sortedBets.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-gray-800 rounded-lg p-3 relative"
                >
                  <button
                    onClick={() => removeBet(bet.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="pr-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-400">
                        {bet.game.sport_title}
                      </div>
                      <div className="text-xs text-green-500 font-semibold">
                        {formatGameTime(bet.game.commence_time)}
                      </div>
                    </div>

                    <div className="text-sm text-white mb-1">
                      {bet.game.home_team} vs {bet.game.away_team}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-300">
                        {bet.betType === 'home' && bet.game.home_team}
                        {bet.betType === 'away' && bet.game.away_team}
                        {bet.betType === 'spread-home' && `${bet.game.home_team} ${bet.spreadValue > 0 ? '+' : ''}${bet.spreadValue}`}
                        {bet.betType === 'spread-away' && `${bet.game.away_team} ${bet.spreadValue > 0 ? '+' : ''}${bet.spreadValue}`}
                        {bet.betType === 'over' && `Over ${bet.totalValue}`}
                        {bet.betType === 'under' && `Under ${bet.totalValue}`}
                      </div>
                      <div className="text-sm font-semibold text-green-500">
                        {bet.odds > 0 ? '+' : ''}{bet.odds}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Fixed Footer */}
          <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Odds:</span>
              <span className="text-white font-semibold">
                {totalOdds > 0 ? '+' : ''}{totalOdds.toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Stake Amount
              </label>
              <Input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter stake"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Potential Payout:</span>
              <PlayMoney 
                amount={potentialPayout} 
                className="text-green-500 font-semibold"
              />
            </div>

            <Button
              onClick={handlePlaceBets}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
              disabled={bets.length === 0 || !stake || parseFloat(stake) <= 0}
            >
              Place Bet
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Balance: <PlayMoney amount={balance} className="text-green-500" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}