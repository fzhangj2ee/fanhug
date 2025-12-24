import { Game } from '@/types/betting';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBetting } from '@/contexts/BettingContext';
import { Clock } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const { addToBetSlip } = useBetting();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">{game.homeTeam}</p>
              {game.isLive && game.homeScore !== undefined && (
                <p className="text-[#00C853] text-2xl font-bold">{game.homeScore}</p>
              )}
            </div>
            <Button
              onClick={() => addToBetSlip(game, 'home', game.homeOdds)}
              className="bg-[#0F1419] hover:bg-[#00C853] text-white border border-[#2A2F36] hover:border-[#00C853] font-mono font-bold min-w-[70px]"
            >
              {game.homeOdds.toFixed(2)}
            </Button>
          </div>

          {game.drawOdds && (
            <div className="flex items-center justify-between">
              <p className="text-[#8B949E] text-sm">Draw</p>
              <Button
                onClick={() => addToBetSlip(game, 'draw', game.drawOdds!)}
                className="bg-[#0F1419] hover:bg-[#00C853] text-white border border-[#2A2F36] hover:border-[#00C853] font-mono font-bold min-w-[70px]"
              >
                {game.drawOdds.toFixed(2)}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">{game.awayTeam}</p>
              {game.isLive && game.awayScore !== undefined && (
                <p className="text-[#00C853] text-2xl font-bold">{game.awayScore}</p>
              )}
            </div>
            <Button
              onClick={() => addToBetSlip(game, 'away', game.awayOdds)}
              className="bg-[#0F1419] hover:bg-[#00C853] text-white border border-[#2A2F36] hover:border-[#00C853] font-mono font-bold min-w-[70px]"
            >
              {game.awayOdds.toFixed(2)}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}