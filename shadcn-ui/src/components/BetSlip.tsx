import { useBetting } from '@/contexts/BettingContext';
import { useWallet } from '@/contexts/WalletContext';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function BetSlip() {
  const { betSlip, removeFromBetSlip, updateStake, placeBets, clearBetSlip } = useBetting();
  const { balance } = useWallet();
  const { oddsChanges } = useLiveOdds();
  const [showDetails, setShowDetails] = useState(false);

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

  const getBetDescription = (item: typeof betSlip[0]) => {
    const getTeamAbbreviation = (teamName: string) => {
      const parts = teamName.split(' ');
      return parts[parts.length - 1].substring(0, 3).toUpperCase();
    };

    switch (item.betType) {
      case 'spread-away':
        return `${getTeamAbbreviation(item.game.awayTeam)} ${item.spreadValue && item.spreadValue > 0 ? '+' : ''}${item.spreadValue}`;
      case 'spread-home':
        return `${getTeamAbbreviation(item.game.homeTeam)} ${item.spreadValue && item.spreadValue > 0 ? '+' : ''}${item.spreadValue}`;
      case 'over':
        return `O ${item.totalValue}`;
      case 'under':
        return `U ${item.totalValue}`;
      case 'away':
        return getTeamAbbreviation(item.game.awayTeam);
      case 'home':
        return getTeamAbbreviation(item.game.homeTeam);
      default:
        return 'Unknown';
    }
  };

  const getBetTypeLabel = (betType: string) => {
    switch (betType) {
      case 'spread-away':
      case 'spread-home':
        return 'Spread';
      case 'over':
      case 'under':
        return 'Total';
      case 'away':
      case 'home':
        return 'Moneyline';
      default:
        return 'Bet';
    }
  };

  const formatAmericanOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const getOddsChange = (gameId: string, betType: string) => {
    const field = betType.includes('away') || betType === 'away' || betType === 'over' ? 'away' : 'home';
    const key = `${gameId}-${field}`;
    return oddsChanges.get(key);
  };

  if (betSlip.length === 0) {
    return (
      <Card className="bg-[#0d0f10] border-[#1a1d1f]">
        <CardHeader className="border-b border-[#1a1d1f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#53d337] text-black text-xs font-bold px-2 py-0.5">
                0
              </Badge>
              <CardTitle className="text-white text-lg font-bold">BET SLIP</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#b1bad3] hover:text-white p-1"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <h3 className="text-white font-bold text-lg">YOUR PICKS WILL SHOW UP HERE.</h3>
            <p className="text-[#b1bad3] text-sm leading-relaxed">
              Select picks to then see the different types of bets available, including Singles, Parlays, Teasers, Round Robins and more.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0d0f10] border-[#1a1d1f]">
      <CardHeader className="border-b border-[#1a1d1f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#53d337] text-black text-xs font-bold px-2 py-0.5">
              {betSlip.length}
            </Badge>
            <CardTitle className="text-white text-lg font-bold">BET SLIP</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#b1bad3] hover:text-white p-1"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearBetSlip}
              className="text-[#b1bad3] hover:text-white text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Bet Items */}
        {betSlip.map((item) => {
          const oddsChange = getOddsChange(item.game.id, item.betType);
          const isIncreasing = oddsChange?.direction === 'up';
          const isDecreasing = oddsChange?.direction === 'down';

          return (
            <div key={item.game.id} className="bg-[#1a1d1f] rounded-lg overflow-hidden">
              {/* Bet Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#0d0f10] border-b border-[#1a1d1f]">
                <span className="text-[#b1bad3] text-xs font-semibold uppercase">
                  {getBetTypeLabel(item.betType)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromBetSlip(item.game.id)}
                  className="text-[#b1bad3] hover:text-white p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Bet Content */}
              <div className="p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {item.game.awayTeam} @ {item.game.homeTeam}
                    </p>
                    <p className="text-[#b1bad3] text-xs mt-0.5">
                      {getBetDescription(item)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isIncreasing && (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    )}
                    {isDecreasing && (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={cn(
                      'text-sm font-bold font-mono',
                      isIncreasing ? 'text-green-400' : isDecreasing ? 'text-red-400' : 'text-[#53d337]'
                    )}>
                      {formatAmericanOdds(item.odds)}
                    </span>
                  </div>
                </div>

                {/* Stake Input */}
                <div className="space-y-1">
                  <label className="text-[#b1bad3] text-xs font-medium">Stake</label>
                  <Input
                    type="number"
                    min="10"
                    step="10"
                    value={item.stake}
                    onChange={(e) => updateStake(item.game.id, Number(e.target.value))}
                    className="bg-[#0d0f10] border-[#2a2d2f] text-white h-9"
                  />
                </div>

                {/* Potential Win */}
                <div className="flex justify-between items-center pt-2 border-t border-[#2a2d2f]">
                  <span className="text-[#b1bad3] text-xs">To Win:</span>
                  <span className="text-[#53d337] font-bold text-sm">
                    ${(item.stake * item.odds).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Summary Section */}
        <div className="bg-[#1a1d1f] rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#b1bad3]">Total Wagered</span>
            <span className="text-white font-bold">${totalStake.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#b1bad3]">Total Potential Payout</span>
            <span className="text-[#53d337] font-bold">${totalPotentialWin.toFixed(2)}</span>
          </div>
        </div>

        {/* View Bets Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#1a1d1f] rounded-lg text-white text-sm font-medium hover:bg-[#2a2d2f] transition-colors"
        >
          <span>View Bets Details</span>
          <span className={cn(
            'transition-transform',
            showDetails && 'rotate-180'
          )}>
            ▼
          </span>
        </button>

        {showDetails && (
          <div className="bg-[#1a1d1f] rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#b1bad3]">Current Balance:</span>
              <span className="text-white">${balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b1bad3]">After Bet Balance:</span>
              <span className="text-white">${(balance - totalStake).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b1bad3]">Number of Bets:</span>
              <span className="text-white">{betSlip.length}</span>
            </div>
          </div>
        )}

        {/* Place Bet Button */}
        <Button
          onClick={handlePlaceBets}
          className="w-full bg-[#53d337] hover:bg-[#45b82e] text-black font-bold text-base py-6"
          disabled={totalStake > balance}
        >
          View My Bets
        </Button>

        {/* Keep Picks in Bet Slip */}
        <button className="w-full text-center text-[#53d337] text-sm font-semibold hover:underline">
          Keep Picks in Bet Slip
        </button>

        {/* Live Odds Update Section */}
        <div className="border-t border-[#1a1d1f] pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#53d337] rounded-full animate-pulse" />
            <h3 className="text-white text-sm font-bold uppercase">Live Odds Updates</h3>
          </div>
          
          <div className="space-y-2">
            {betSlip.map((item) => {
              const oddsChange = getOddsChange(item.game.id, item.betType);
              const isIncreasing = oddsChange?.direction === 'up';
              const isDecreasing = oddsChange?.direction === 'down';

              return (
                <div 
                  key={`live-${item.game.id}`} 
                  className={cn(
                    'bg-[#1a1d1f] rounded p-2 transition-all duration-300',
                    isIncreasing && 'border border-green-500/30 bg-green-500/5',
                    isDecreasing && 'border border-red-500/30 bg-red-500/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">
                        {getBetDescription(item)}
                      </p>
                      <p className="text-[#b1bad3] text-[10px]">
                        {getBetTypeLabel(item.betType)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isIncreasing && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-400" />
                          <span className="text-green-400 text-xs font-bold">
                            {formatAmericanOdds(item.odds)}
                          </span>
                        </div>
                      )}
                      {isDecreasing && (
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-red-400" />
                          <span className="text-red-400 text-xs font-bold">
                            {formatAmericanOdds(item.odds)}
                          </span>
                        </div>
                      )}
                      {!isIncreasing && !isDecreasing && (
                        <span className="text-[#b1bad3] text-xs font-bold">
                          {formatAmericanOdds(item.odds)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[#b1bad3] text-[10px] text-center">
            Odds update every 15 seconds • Green = Better odds • Red = Worse odds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}