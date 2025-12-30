import { useBetting } from '@/contexts/BettingContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function MyBets() {
  const { placedBets } = useBetting();

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getBetTypeLabel = (betType: string) => {
    const labels: Record<string, string> = {
      'home': 'Moneyline',
      'away': 'Moneyline',
      'spread-home': 'Spread',
      'spread-away': 'Spread',
      'over': 'Total',
      'under': 'Total',
    };
    return labels[betType] || betType;
  };

  const getBetDescription = (bet: typeof placedBets[0]) => {
    switch (bet.betType) {
      case 'spread-away':
        return `${bet.game.awayTeam} ${bet.spreadValue && bet.spreadValue > 0 ? '+' : ''}${bet.spreadValue}`;
      case 'spread-home':
        return `${bet.game.homeTeam} ${bet.spreadValue && bet.spreadValue > 0 ? '+' : ''}${bet.spreadValue}`;
      case 'over':
        return `Over ${bet.totalValue}`;
      case 'under':
        return `Under ${bet.totalValue}`;
      case 'away':
        return bet.game.awayTeam;
      case 'home':
        return bet.game.homeTeam;
      default:
        return 'Unknown';
    }
  };

  const pendingBets = placedBets.filter(bet => bet.status === 'pending');
  const settledBets = placedBets.filter(bet => bet.status !== 'pending');

  const totalWagered = placedBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalWon = placedBets
    .filter(bet => bet.status === 'won')
    .reduce((sum, bet) => sum + (bet.payout || 0), 0);
  const totalLost = placedBets
    .filter(bet => bet.status === 'lost')
    .reduce((sum, bet) => sum + bet.stake, 0);

  return (
    <div className="min-h-screen bg-[#0d0f10]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">My Bets</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
            <CardContent className="p-4">
              <p className="text-[#b1bad3] text-sm mb-1">Total Bets</p>
              <p className="text-white text-2xl font-bold">{placedBets.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
            <CardContent className="p-4">
              <p className="text-[#b1bad3] text-sm mb-1">Total Wagered</p>
              <p className="text-white text-2xl font-bold">‖{totalWagered.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4">
              <p className="text-green-400 text-sm mb-1">Total Won</p>
              <p className="text-green-400 text-2xl font-bold">‖{totalWon.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <p className="text-red-400 text-sm mb-1">Total Lost</p>
              <p className="text-red-400 text-2xl font-bold">‖{totalLost.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bets */}
        {pendingBets.length > 0 && (
          <Card className="bg-[#1a1d1f] border-[#2a2d2f] mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Bets ({pendingBets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingBets.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-[#0d0f10] rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">
                          {getBetDescription(bet)}
                        </span>
                        <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">
                          {getBetTypeLabel(bet.betType)}
                        </Badge>
                      </div>
                      <p className="text-[#b1bad3] text-sm">
                        {bet.game.homeTeam} @ {bet.game.awayTeam}
                      </p>
                    </div>
                    <span className="text-white font-bold">
                      {formatOdds(bet.odds)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-[#2a2d2f]">
                    <span className="text-[#b1bad3]">Stake:</span>
                    <span className="text-white font-medium">‖{bet.stake.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#b1bad3]">Potential Win:</span>
                    <span className="text-green-400 font-medium">
                      ‖{(bet.stake * bet.odds).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Settled Bets */}
        <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
          <CardHeader>
            <CardTitle className="text-white">
              Bet History ({settledBets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settledBets.length === 0 ? (
              <p className="text-[#b1bad3] text-center py-8">
                No settled bets yet
              </p>
            ) : (
              settledBets.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-[#0d0f10] rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {bet.status === 'won' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-white font-medium">
                          {getBetDescription(bet)}
                        </span>
                        <Badge
                          className={
                            bet.status === 'won'
                              ? 'bg-green-500/20 text-green-500 text-xs'
                              : 'bg-red-500/20 text-red-500 text-xs'
                          }
                        >
                          {bet.status === 'won' ? 'Won' : 'Lost'}
                        </Badge>
                      </div>
                      <p className="text-[#b1bad3] text-sm">
                        {bet.game.homeTeam} @ {bet.game.awayTeam}
                      </p>
                      <p className="text-[#b1bad3] text-xs mt-1">
                        {getBetTypeLabel(bet.betType)} • {formatOdds(bet.odds)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-[#2a2d2f]">
                    <span className="text-[#b1bad3]">Stake:</span>
                    <span className="text-white font-medium">‖{bet.stake.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#b1bad3]">
                      {bet.status === 'won' ? 'Payout:' : 'Lost:'}
                    </span>
                    <span
                      className={
                        bet.status === 'won'
                          ? 'text-green-400 font-medium'
                          : 'text-red-400 font-medium'
                      }
                    >
                      ‖{bet.status === 'won' 
                        ? (bet.payout || 0).toFixed(2)
                        : bet.stake.toFixed(2)
                      }
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}