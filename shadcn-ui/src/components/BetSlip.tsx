import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown, Info, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function BetSlip() {
  const { betSlip, removeFromBetSlip, updateStake, placeBets, clearBetSlip } = useBetting();
  const { user } = useAuth();
  const { oddsChanges } = useLiveOdds();
  const navigate = useNavigate();

  const totalStake = betSlip.reduce((sum, item) => sum + item.stake, 0);
  const totalPotentialWin = betSlip.reduce((sum, item) => sum + item.stake * item.odds, 0);

  // Check if all bets have valid stakes (> 0)
  const hasValidStakes = betSlip.length > 0 && betSlip.every(item => item.stake > 0);
  const canPlaceBets = hasValidStakes && user !== null;

  const handlePlaceBets = () => {
    if (!user) {
      toast.error('Please login to place bets');
      return;
    }

    if (!hasValidStakes) {
      toast.error('Please enter a valid stake amount for all bets');
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
        return `Over ${item.totalValue}`;
      case 'under':
        return `Under ${item.totalValue}`;
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

  // If user is not logged in, show login prompt
  if (!user) {
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
            <Button
              variant="ghost"
              size="sm"
              onClick={clearBetSlip}
              className="text-[#b1bad3] hover:text-white text-xs"
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {/* Show bet items but disabled */}
          {betSlip.map((item) => {
            const oddsChange = getOddsChange(item.game.id, item.betType);
            const isIncreasing = oddsChange?.direction === 'up';
            const isDecreasing = oddsChange?.direction === 'down';

            return (
              <div key={item.game.id} className="bg-[#1a1d1f] rounded-lg p-3 space-y-3 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromBetSlip(item.game.id)}
                        className="text-[#b1bad3] hover:text-white p-0 h-auto -ml-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <span className="text-white text-sm font-medium">
                        {getBetDescription(item)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <span className="text-[#b1bad3] text-xs">
                        {getBetTypeLabel(item.betType)}
                      </span>
                    </div>
                    <p className="text-[#b1bad3] text-xs mt-1 ml-6">
                      {item.game.homeTeam} @ {item.game.awayTeam}
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
                      isIncreasing ? 'text-green-400' : isDecreasing ? 'text-red-400' : 'text-white'
                    )}>
                      {formatAmericanOdds(item.odds)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Login Required Message */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-yellow-500" />
              <h3 className="text-yellow-500 font-bold text-sm">LOGIN REQUIRED</h3>
            </div>
            <p className="text-[#b1bad3] text-sm">
              Please login to place bets and track your betting history.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-[#53d337] hover:bg-[#45b82e] text-black font-bold"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login to Place Bets
            </Button>
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
        {/* SINGLES Section Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-bold uppercase">SINGLES</h3>
        </div>

        {/* Bet Items */}
        {betSlip.map((item) => {
          const oddsChange = getOddsChange(item.game.id, item.betType);
          const isIncreasing = oddsChange?.direction === 'up';
          const isDecreasing = oddsChange?.direction === 'down';
          const itemPayout = item.stake > 0 ? (item.stake * item.odds) : 0;

          return (
            <div key={item.game.id} className="bg-[#1a1d1f] rounded-lg p-3 space-y-3">
              {/* Bet Header with Remove Button */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromBetSlip(item.game.id)}
                      className="text-[#b1bad3] hover:text-white p-0 h-auto -ml-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <span className="text-white text-sm font-medium">
                      {getBetDescription(item)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <span className="text-[#b1bad3] text-xs">
                      {getBetTypeLabel(item.betType)}
                    </span>
                  </div>
                  <p className="text-[#b1bad3] text-xs mt-1 ml-6">
                    {item.game.homeTeam} @ {item.game.awayTeam}
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
                    isIncreasing ? 'text-green-400' : isDecreasing ? 'text-red-400' : 'text-white'
                  )}>
                    {formatAmericanOdds(item.odds)}
                  </span>
                </div>
              </div>

              {/* Stake Input with $ prefix */}
              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-sm font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.stake || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value);
                      updateStake(item.game.id, Math.max(0, value));
                    }}
                    placeholder="0.00"
                    className="bg-[#0d0f10] border-[#2a2d2f] text-white h-10 pl-7 pr-3 text-sm font-medium"
                  />
                </div>
                {item.stake > 0 && (
                  <p className="text-[#b1bad3] text-xs">
                    Payout: ${itemPayout.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Place Bet Button */}
        <Button
          onClick={handlePlaceBets}
          disabled={!canPlaceBets}
          className={cn(
            "w-full font-bold text-base py-6 transition-all",
            canPlaceBets
              ? "bg-[#53d337] hover:bg-[#45b82e] text-black"
              : "bg-[#2a2d2f] text-[#6b6e70] cursor-not-allowed hover:bg-[#2a2d2f]"
          )}
        >
          <div className="flex flex-col items-center">
            <span>Place Bet ${totalStake.toFixed(2)}</span>
            {canPlaceBets && (
              <span className="text-xs font-normal mt-0.5">
                Total Payout: ${totalPotentialWin.toFixed(2)}
              </span>
            )}
          </div>
        </Button>

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