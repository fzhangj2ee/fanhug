import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function BetSlip() {
  const { betSlip, removeFromBetSlip, updateStake, placeBets, clearBetSlip } = useBetting();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalStake = betSlip.reduce((sum, item) => sum + item.stake, 0);
  const totalPotentialWin = betSlip.reduce((sum, item) => {
    const odds = item.odds;
    if (odds > 0) {
      return sum + item.stake + (item.stake * odds / 100);
    } else {
      return sum + item.stake + (item.stake * 100 / Math.abs(odds));
    }
  }, 0);

  const handlePlaceBets = () => {
    if (!user) {
      toast.error('Please login to place bets', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login'),
        },
      });
      return;
    }

    const success = placeBets();
    if (success) {
      toast.success('Bets placed successfully!');
    } else {
      toast.error('Failed to place bets. Check your balance.');
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getBetTypeLabel = (betType: string) => {
    const labels: Record<string, string> = {
      'home': 'ML',
      'away': 'ML',
      'spread-home': 'Spread',
      'spread-away': 'Spread',
      'over': 'Over',
      'under': 'Under',
    };
    return labels[betType] || betType;
  };

  return (
    <Card className="border-gray-700 bg-gray-800/50 backdrop-blur sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">
              {betSlip.length}
            </div>
            BET SLIP
          </CardTitle>
          {betSlip.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearBetSlip}
              className="text-gray-400 hover:text-white h-8 px-2"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {betSlip.length === 0 ? (
          <div className="text-center py-8">
            {!user ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                    <LogIn className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-lg"
                >
                  Log In to Place Bet
                </Button>
                <p className="text-sm text-gray-400">Minimum Bet: $0.10</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Select picks to add them to your bet slip
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Singles Section */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">SINGLES</h3>
              <div className="space-y-3">
                {betSlip.map((item) => (
                  <div
                    key={item.game.id}
                    className="bg-gray-900/50 rounded-lg p-3 space-y-2"
                  >
                    {/* Bet Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">
                            {item.betType === 'over' || item.betType === 'under'
                              ? `${item.betType === 'over' ? 'Over' : 'Under'} ${item.totalValue}`
                              : item.betType.includes('spread')
                              ? `${item.betType === 'spread-home' ? item.game.homeTeam : item.game.awayTeam} ${item.spreadValue && item.spreadValue > 0 ? '+' : ''}${item.spreadValue}`
                              : item.betType === 'home'
                              ? item.game.homeTeam
                              : item.game.awayTeam}
                          </span>
                          <span className="text-green-400 text-sm font-medium">
                            {formatOdds(item.odds)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {getBetTypeLabel(item.betType)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.game.homeTeam} @ {item.game.awayTeam}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromBetSlip(item.game.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stake Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        Stake:
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          $
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.stake || ''}
                          onChange={(e) =>
                            updateStake(item.game.id, parseFloat(e.target.value) || 0)
                          }
                          className="pl-6 bg-gray-800 border-gray-600 text-white h-8 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Potential Win */}
                    {item.stake > 0 && (
                      <div className="flex justify-between text-xs pt-2 border-t border-gray-700">
                        <span className="text-gray-400">To Win:</span>
                        <span className="text-green-400 font-medium">
                          ${(item.odds > 0
                            ? item.stake * item.odds / 100
                            : item.stake * 100 / Math.abs(item.odds)
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Stake:</span>
                <span className="text-white font-medium">${totalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Win:</span>
                <span className="text-green-400 font-bold">
                  ${totalPotentialWin.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Bet Button */}
            {user ? (
              <Button
                onClick={handlePlaceBets}
                disabled={totalStake === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Bet
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-lg"
              >
                Log In to Place Bet
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}