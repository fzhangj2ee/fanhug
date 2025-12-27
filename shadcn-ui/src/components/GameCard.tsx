import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { Game } from '@/types/betting';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const { addToBetSlip } = useBetting();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBetClick = (betType: string, team: string, odds: number) => {
    if (!user) {
      toast.error('Please login to place bets', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login'),
        },
      });
      return;
    }

    addToBetSlip(game.id, betType, team, odds);
    toast.success(`Added ${team} ${betType} to bet slip`);
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors">
      <CardContent className="p-4">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{game.league}</span>
            {game.isLive && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse">
                LIVE
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{game.time}</span>
        </div>

        {/* Teams */}
        <div className="space-y-3 mb-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                {game.awayTeam.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-white font-medium">{game.awayTeam}</span>
              {game.isLive && game.awayScore !== undefined && (
                <span className="text-xl font-bold text-white ml-auto">{game.awayScore}</span>
              )}
            </div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                {game.homeTeam.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-white font-medium">{game.homeTeam}</span>
              {game.isLive && game.homeScore !== undefined && (
                <span className="text-xl font-bold text-white ml-auto">{game.homeScore}</span>
              )}
            </div>
          </div>
        </div>

        {/* Betting Options */}
        <div className="space-y-2">
          {/* Moneyline */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-xs text-gray-400 flex items-center">Moneyline</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBetClick('Moneyline', game.awayTeam, game.awayOdds)}
              className="border-gray-600 hover:bg-gray-700 hover:border-green-500 text-white h-8"
            >
              {formatOdds(game.awayOdds)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBetClick('Moneyline', game.homeTeam, game.homeOdds)}
              className="border-gray-600 hover:bg-gray-700 hover:border-green-500 text-white h-8"
            >
              {formatOdds(game.homeOdds)}
            </Button>
          </div>

          {/* Spread */}
          {game.spread && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs text-gray-400 flex items-center">Spread</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleBetClick(
                    `Spread ${game.spread > 0 ? '+' : ''}${game.spread}`,
                    game.awayTeam,
                    game.awaySpreadOdds || -110
                  )
                }
                className="border-gray-600 hover:bg-gray-700 hover:border-green-500 text-white h-8"
              >
                <span className="text-xs">
                  {game.spread > 0 ? '+' : ''}
                  {game.spread}
                </span>
                <span className="ml-1">{formatOdds(game.awaySpreadOdds || -110)}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleBetClick(
                    `Spread ${-game.spread > 0 ? '+' : ''}${-game.spread}`,
                    game.homeTeam,
                    game.homeSpreadOdds || -110
                  )
                }
                className="border-gray-600 hover:bg-gray-700 hover:border-green-500 text-white h-8"
              >
                <span className="text-xs">
                  {-game.spread > 0 ? '+' : ''}
                  {-game.spread}
                </span>
                <span className="ml-1">{formatOdds(game.homeSpreadOdds || -110)}</span>
              </Button>
            </div>
          )}

          {/* Total */}
          {game.total && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs text-gray-400 flex items-center">Total</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleBetClick(`Over ${game.total}`, `O ${game.total}`, game.overOdds || -110)
                }
                className="border-gray-600 hover:bg-gray-700 hover:border-green-500 text-white h-8"
              >
                <span className="text-xs">O {game.total}</span>
                <span className="ml-1">{formatOdds(game.overOdds || -110)}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleBetClick(`Under ${game.total}`, `U ${game.total}`, game.underOdds || -110)
                }
                className="border-gray-600 hover:bg-gray-700 hover:border-green-500 text-white h-8"
              >
                <span className="text-xs">U {game.total}</span>
                <span className="ml-1">{formatOdds(game.underOdds || -110)}</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}