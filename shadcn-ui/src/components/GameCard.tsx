import { Game } from '@/types/betting';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBetting } from '@/contexts/BettingContext';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  liveOdds?: Record<string, unknown>;
}

export default function GameCard({ game }: GameCardProps) {
  const { addToBetSlip } = useBetting();
  const { oddsChanges } = useLiveOdds();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatAmericanOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const getOddsChange = (field: 'homeOdds' | 'awayOdds' | 'drawOdds') => {
    const key = `${game.id}-${field.replace('Odds', '')}`;
    return oddsChanges.get(key);
  };

  const renderOddsButton = (
    odds: number,
    betType: 'home' | 'away' | 'draw' | 'spread-home' | 'spread-away' | 'over' | 'under',
    field: 'homeOdds' | 'awayOdds' | 'drawOdds',
    label?: string,
    line?: number
  ) => {
    const change = getOddsChange(field);
    const isIncreasing = change?.direction === 'up';
    const isDecreasing = change?.direction === 'down';

    return (
      <Button
        onClick={() => addToBetSlip(game, betType, odds)}
        className={cn(
          'bg-[#0F1419] hover:bg-[#00C853] text-white border border-[#2A2F36] hover:border-[#00C853] font-mono font-bold min-w-[80px] transition-all duration-300 relative',
          isIncreasing && 'border-green-500 bg-green-500/10',
          isDecreasing && 'border-red-500 bg-red-500/10'
        )}
      >
        <div className="flex flex-col items-center">
          {label && <span className="text-[10px] text-[#8B949E]">{label}</span>}
          {line !== undefined && <span className="text-xs">{line > 0 ? `+${line}` : line}</span>}
          <span className={cn(
            'transition-all duration-300',
            isIncreasing && 'text-green-400',
            isDecreasing && 'text-red-400'
          )}>
            {formatAmericanOdds(odds)}
          </span>
        </div>
        {isIncreasing && (
          <TrendingUp className="h-3 w-3 ml-1 text-green-400 animate-bounce absolute top-1 right-1" />
        )}
        {isDecreasing && (
          <TrendingDown className="h-3 w-3 ml-1 text-red-400 animate-bounce absolute top-1 right-1" />
        )}
      </Button>
    );
  };

  return (
    <Card className="bg-[#1C2128] border-[#2A2F36] hover:border-[#00C853] transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="bg-[#0F1419] text-white border-[#2A2F36]">
            {game.sport}
          </Badge>
          {game.isLive ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse" />
              <span className="text-[#FF3B30] text-xs font-bold">LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#8B949E] text-xs">
              <Clock className="h-3 w-3" />
              {formatTime(game.startTime)}
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="text-white font-medium text-sm mb-1">
            {game.awayTeam}
            {game.isLive && game.awayScore !== undefined && (
              <span className="text-[#00C853] text-lg font-bold ml-2">{game.awayScore}</span>
            )}
          </div>
          <div className="text-white font-medium text-sm">
            {game.homeTeam}
            {game.isLive && game.homeScore !== undefined && (
              <span className="text-[#00C853] text-lg font-bold ml-2">{game.homeScore}</span>
            )}
          </div>
        </div>

        <Tabs defaultValue="moneyline" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#0F1419]">
            <TabsTrigger value="moneyline" className="text-xs">Moneyline</TabsTrigger>
            <TabsTrigger value="spread" className="text-xs" disabled={!game.spread}>Spread</TabsTrigger>
            <TabsTrigger value="total" className="text-xs" disabled={!game.total}>Total</TabsTrigger>
          </TabsList>
          
          <TabsContent value="moneyline" className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-[#8B949E] text-xs mb-1 truncate">{game.awayTeam}</div>
                {game.moneyline && renderOddsButton(
                  game.moneyline.away,
                  'away',
                  'awayOdds'
                )}
              </div>
              <div className="text-center">
                <div className="text-[#8B949E] text-xs mb-1 truncate">{game.homeTeam}</div>
                {game.moneyline && renderOddsButton(
                  game.moneyline.home,
                  'home',
                  'homeOdds'
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="spread" className="mt-3">
            {game.spread && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-[#8B949E] text-xs mb-1 truncate">{game.awayTeam}</div>
                  {renderOddsButton(
                    game.spread.awayOdds,
                    'spread-away',
                    'awayOdds',
                    undefined,
                    game.spread.away
                  )}
                </div>
                <div className="text-center">
                  <div className="text-[#8B949E] text-xs mb-1 truncate">{game.homeTeam}</div>
                  {renderOddsButton(
                    game.spread.homeOdds,
                    'spread-home',
                    'homeOdds',
                    undefined,
                    game.spread.home
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="total" className="mt-3">
            {game.total && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-[#8B949E] text-xs mb-1">Over</div>
                  {renderOddsButton(
                    game.total.overOdds,
                    'over',
                    'homeOdds',
                    `O ${game.total.over}`
                  )}
                </div>
                <div className="text-center">
                  <div className="text-[#8B949E] text-xs mb-1">Under</div>
                  {renderOddsButton(
                    game.total.underOdds,
                    'under',
                    'awayOdds',
                    `U ${game.total.under}`
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}