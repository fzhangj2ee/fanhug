import { Game } from '@/types/betting';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBetting } from '@/contexts/BettingContext';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const { addToBetSlip } = useBetting();
  const { oddsChanges } = useLiveOdds();
  const [isFavorite, setIsFavorite] = useState(false);

  const formatGameDateTime = (date: Date) => {
    const gameDate = new Date(date);
    const today = new Date();
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    const gameDateOnly = new Date(gameDate);
    gameDateOnly.setHours(0, 0, 0, 0);
    
    const isToday = gameDateOnly.getTime() === today.getTime();
    
    const timeStr = gameDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (isToday) {
      return `Today ${timeStr}`;
    } else {
      const dateStr = gameDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      return `${dateStr} ${timeStr}`;
    }
  };

  const formatAmericanOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const getOddsChange = (field: 'homeOdds' | 'awayOdds') => {
    const key = `${game.id}-${field.replace('Odds', '')}`;
    return oddsChanges.get(key);
  };

  const renderOddsCell = (
    odds: number,
    betType: 'home' | 'away' | 'spread-home' | 'spread-away' | 'over' | 'under',
    field: 'homeOdds' | 'awayOdds',
    value?: number
  ) => {
    const change = getOddsChange(field);
    const isIncreasing = change?.direction === 'up';
    const isDecreasing = change?.direction === 'down';

    return (
      <button
        onClick={() => addToBetSlip(game, betType, odds, value)}
        className={cn(
          'flex flex-col items-center justify-center px-2 bg-[#1a1d1f] hover:bg-[#2a2d2f] border border-[#2a2d2f] transition-all duration-200 min-w-[80px] relative group h-[60px]',
          isIncreasing && 'border-green-500/30 bg-green-500/5',
          isDecreasing && 'border-red-500/30 bg-red-500/5'
        )}
      >
        {value !== undefined && (
          <span className="text-[11px] text-[#b1bad3] font-medium mb-0.5">
            {value > 0 ? `+${value}` : value}
          </span>
        )}
        <span className={cn(
          'text-sm font-bold transition-colors',
          isIncreasing ? 'text-green-400' : isDecreasing ? 'text-red-400' : 'text-[#53d337]'
        )}>
          {formatAmericanOdds(odds)}
        </span>
        {isIncreasing && (
          <TrendingUp className="h-3 w-3 text-green-400 absolute top-1 right-1" />
        )}
        {isDecreasing && (
          <TrendingDown className="h-3 w-3 text-red-400 absolute top-1 right-1" />
        )}
      </button>
    );
  };

  const getTeamAbbreviation = (teamName: string) => {
    const parts = teamName.split(' ');
    return parts[parts.length - 1].substring(0, 3).toUpperCase();
  };

  return (
    <Card className="bg-[#0d0f10] border-[#1a1d1f] hover:border-[#2a2d2f] transition-all duration-200 overflow-hidden">
      <div className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a1d1f]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-[#b1bad3] hover:text-[#53d337] transition-colors"
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-[#53d337] text-[#53d337]")} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#b1bad3] font-medium">{game.awayTeam}</span>
              <span className="text-[#5f6368] text-xs">AT</span>
              <span className="text-xs text-[#b1bad3] font-medium">{game.homeTeam}</span>
            </div>
          </div>
          {game.isLive ? (
            <Badge className="bg-[#53d337] text-black text-[10px] font-bold px-2 py-0.5">
              LIVE
            </Badge>
          ) : (
            <Badge className="bg-[#53d337] text-black text-[10px] font-bold px-2 py-0.5">
              {formatGameDateTime(game.startTime)}
            </Badge>
          )}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] divide-x divide-[#1a1d1f]">
          {/* Teams Column */}
          <div className="divide-y divide-[#1a1d1f]">
            {/* Away Team */}
            <div className="flex items-center gap-3 px-4 bg-[#0d0f10] h-[60px]">
              <div className="w-6 h-6 bg-[#1a1d1f] rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#b1bad3]">
                  {getTeamAbbreviation(game.awayTeam)}
                </span>
              </div>
              <span className="text-sm text-white font-medium flex-1">{game.awayTeam}</span>
              {game.isLive && game.awayScore !== undefined && (
                <span className="text-lg font-bold text-white">{game.awayScore}</span>
              )}
            </div>
            {/* Home Team */}
            <div className="flex items-center gap-3 px-4 bg-[#0d0f10] h-[60px]">
              <div className="w-6 h-6 bg-[#1a1d1f] rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#b1bad3]">
                  {getTeamAbbreviation(game.homeTeam)}
                </span>
              </div>
              <span className="text-sm text-white font-medium flex-1">{game.homeTeam}</span>
              {game.isLive && game.homeScore !== undefined && (
                <span className="text-lg font-bold text-white">{game.homeScore}</span>
              )}
            </div>
          </div>

          {/* Spread Column */}
          <div className="min-w-[80px]">
            <div className="text-center py-1.5 bg-[#0d0f10] border-b border-[#1a1d1f]">
              <span className="text-[10px] text-[#b1bad3] font-semibold uppercase">Spread</span>
            </div>
            <div className="divide-y divide-[#1a1d1f]">
              {game.spread ? (
                <>
                  {renderOddsCell(game.spread.awayOdds, 'spread-away', 'awayOdds', game.spread.away)}
                  {renderOddsCell(game.spread.homeOdds, 'spread-home', 'homeOdds', game.spread.home)}
                </>
              ) : (
                <>
                  <div className="px-2 bg-[#1a1d1f]/30 h-[60px]"></div>
                  <div className="px-2 bg-[#1a1d1f]/30 h-[60px]"></div>
                </>
              )}
            </div>
          </div>

          {/* Total Column */}
          <div className="min-w-[80px]">
            <div className="text-center py-1.5 bg-[#0d0f10] border-b border-[#1a1d1f]">
              <span className="text-[10px] text-[#b1bad3] font-semibold uppercase">Total</span>
            </div>
            <div className="divide-y divide-[#1a1d1f]">
              {game.total ? (
                <>
                  {renderOddsCell(game.total.overOdds, 'over', 'homeOdds', game.total.over)}
                  {renderOddsCell(game.total.underOdds, 'under', 'awayOdds', game.total.under)}
                </>
              ) : (
                <>
                  <div className="px-2 bg-[#1a1d1f]/30 h-[60px]"></div>
                  <div className="px-2 bg-[#1a1d1f]/30 h-[60px]"></div>
                </>
              )}
            </div>
          </div>

          {/* Moneyline Column */}
          <div className="min-w-[80px]">
            <div className="text-center py-1.5 bg-[#0d0f10] border-b border-[#1a1d1f]">
              <span className="text-[10px] text-[#b1bad3] font-semibold uppercase">Moneyline</span>
            </div>
            <div className="divide-y divide-[#1a1d1f]">
              {game.moneyline ? (
                <>
                  {renderOddsCell(game.moneyline.away, 'away', 'awayOdds')}
                  {renderOddsCell(game.moneyline.home, 'home', 'homeOdds')}
                </>
              ) : (
                <>
                  <div className="px-2 bg-[#1a1d1f]/30 h-[60px]"></div>
                  <div className="px-2 bg-[#1a1d1f]/30 h-[60px]"></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}