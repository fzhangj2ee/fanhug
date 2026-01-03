import { useBetting } from '@/contexts/BettingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import PlayMoney from '@/components/PlayMoney';

export default function MyBets() {
  const { placedBets } = useBetting();

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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

  // Sort bets by placement time (newest first)
  const sortedBets = [...placedBets].sort((a, b) => 
    new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );

  const pendingBets = sortedBets.filter(bet => bet.status === 'pending');
  const settledBets = sortedBets.filter(bet => bet.status !== 'pending');

  const totalWagered = placedBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalWon = placedBets
    .filter(bet => bet.status === 'won')
    .reduce((sum, bet) => sum + (bet.payout || 0), 0);
  const totalLost = placedBets
    .filter(bet => bet.status === 'lost')
    .reduce((sum, bet) => sum + bet.stake, 0);

  return (
    <div className="min-h-screen bg-[#0d0f10]">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-white mb-6">My Bets</h1>

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
              <PlayMoney amount={totalWagered} className="text-white text-2xl font-bold" />
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4">
              <p className="text-green-400 text-sm mb-1">Total Won</p>
              <PlayMoney amount={totalWon} className="text-green-400 text-2xl font-bold" />
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <p className="text-red-400 text-sm mb-1">Total Lost</p>
              <PlayMoney amount={totalLost} className="text-red-400 text-2xl font-bold" />
            </CardContent>
          </Card>
        </div>

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
                        {bet.game.awayTeam} @ {bet.game.homeTeam}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#8B949E]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Game: {formatDateTime(bet.game.startTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#8B949E]">
                        <Clock className="h-3 w-3" />
                        <span>Placed: {formatDateTime(bet.placedAt)}</span>
                      </div>
                    </div>
                    <span className="text-white font-bold">
                      {formatOdds(bet.odds)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-[#2a2d2f]">
                    <span className="text-[#b1bad3]">Stake:</span>
                    <PlayMoney amount={bet.stake} className="text-white font-medium" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#b1bad3]">Potential Win:</span>
                    <PlayMoney amount={bet.stake * bet.odds} className="text-green-400 font-medium" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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
                        {bet.game.awayTeam} @ {bet.game.homeTeam}
                      </p>
                      <p className="text-[#b1bad3] text-xs mt-1">
                        {getBetTypeLabel(bet.betType)} • {formatOdds(bet.odds)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#8B949E]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Game: {formatDateTime(bet.game.startTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#8B949E]">
                        <Clock className="h-3 w-3" />
                        <span>Placed: {formatDateTime(bet.placedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-[#2a2d2f]">
                    <span className="text-[#b1bad3]">Stake:</span>
                    <PlayMoney amount={bet.stake} className="text-white font-medium" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#b1bad3]">
                      {bet.status === 'won' ? 'Payout:' : 'Lost:'}
                    </span>
                    <PlayMoney 
                      amount={bet.status === 'won' ? (bet.payout || 0) : bet.stake}
                      className={bet.status === 'won' ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}
                    />
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