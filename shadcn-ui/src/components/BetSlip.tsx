import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { X, LogIn, ChevronDown, Info, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import PlayMoney from '@/components/PlayMoney';

export default function BetSlip() {
  const { betSlip, removeFromBetSlip, updateStake, placeBets, clearBetSlip } = useBetting();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBetPlaced, setShowBetPlaced] = useState(false);
  const [lastBetDetails, setLastBetDetails] = useState({ totalStake: 0, totalPayout: 0 });
  const [showDetails, setShowDetails] = useState(false);

  // Auto-hide "BET PLACED" dialog when new bets are added
  useEffect(() => {
    if (showBetPlaced && betSlip.length > 0) {
      setShowBetPlaced(false);
    }
  }, [betSlip.length, showBetPlaced]);

  const totalStake = betSlip.reduce((sum, item) => sum + item.stake, 0);
  
  const totalPotentialWin = betSlip.reduce((sum, item) => {
    const odds = item.odds;
    return sum + (item.stake * odds);
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

    const betDetails = {
      totalStake,
      totalPayout: totalPotentialWin,
    };

    const success = placeBets();
    if (success) {
      setLastBetDetails(betDetails);
      setShowBetPlaced(true);
      toast.success('Bets placed successfully!');
    } else {
      toast.error('Failed to place bets. Check your balance.');
    }
  };

  const handleClose = () => {
    setShowBetPlaced(false);
  };

  const handleViewMyBets = () => {
    setShowBetPlaced(false);
    navigate('/my-bets');
  };

  const handleClearAll = () => {
    clearBetSlip();
    toast.success('Bet slip cleared');
  };

  const formatOdds = (odds: number) => {
    return odds.toFixed(2);
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
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2 tracking-wider">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">
              {betSlip.length}
            </div>
            BET SLIP
          </CardTitle>
          <div className="flex items-center gap-2">
            {betSlip.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showBetPlaced ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border-2 border-green-500 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-green-500 font-bold text-lg">BET PLACED</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white rounded-full bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Wagered</span>
                  <PlayMoney amount={lastBetDetails.totalStake} className="text-white font-medium" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Potential Payout</span>
                  <PlayMoney amount={lastBetDetails.totalPayout} className="text-green-500 font-bold" />
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full justify-between text-white hover:bg-gray-700/50 h-12"
              >
                <span className="font-medium">View Bets Details</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </Button>

              <Button
                onClick={handleViewMyBets}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-base"
              >
                View My Bets
              </Button>
            </div>
          </div>
        ) : betSlip.length === 0 ? (
          <div className="text-center py-8">
            {!user ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center">
                    <LogIn className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-lg"
                >
                  Log In to Place Bet
                </Button>
                <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  Minimum Bet: <PlayMoney amount={0.10} className="" />
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg">YOUR PICKS WILL SHOW UP HERE.</h3>
                <p className="text-gray-400 text-sm">
                  Select picks to then see the different types of bets available, including Singles, Parlays, Teasers, Round Robins and more.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-bold text-white mb-3">SINGLES</h3>
              <div className="space-y-3">
                {betSlip.map((item) => (
                  <div
                    key={item.game.id}
                    className="bg-gray-900/50 rounded-lg p-3 space-y-2"
                  >
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

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        Stake:
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          <span className="relative inline-block">
                            <span className="absolute inset-0 translate-x-[0.15em]">$</span>
                            <span className="relative">$</span>
                          </span>
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.stake || ''}
                          onChange={(e) =>
                            updateStake(item.game.id, parseFloat(e.target.value) || 0)
                          }
                          className="pl-8 bg-gray-800 border-gray-600 text-white h-8 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {item.stake > 0 && (
                      <div className="flex justify-between text-xs pt-2 border-t border-gray-700">
                        <span className="text-gray-400">Total Return:</span>
                        <PlayMoney amount={item.stake * item.odds} className="text-green-400 font-medium" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Stake:</span>
                <PlayMoney amount={totalStake} className="text-white font-medium" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Return:</span>
                <PlayMoney amount={totalPotentialWin} className="text-green-400 font-bold" />
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-gray-400">Profit:</span>
                <PlayMoney amount={totalPotentialWin - totalStake} className="text-green-400 font-bold" />
              </div>
            </div>

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