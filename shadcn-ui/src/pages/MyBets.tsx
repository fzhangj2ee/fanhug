import { useBetting } from '@/contexts/BettingContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyBets() {
  const { bets } = useBetting();
  const navigate = useNavigate();

  const pendingBets = bets.filter((bet) => bet.status === 'pending');
  const wonBets = bets.filter((bet) => bet.status === 'won');
  const lostBets = bets.filter((bet) => bet.status === 'lost');

  const totalWon = wonBets.reduce((sum, bet) => sum + (bet.payout || bet.potentialWin), 0);
  const totalLost = lostBets.reduce((sum, bet) => sum + bet.stake, 0);
  const netProfit = totalWon - totalLost;

  const handleHomeClick = () => {
    navigate('/');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getBetDescription = (bet: typeof bets[0]) => {
    const { betType, line, marketType } = bet;
    
    if (marketType === 'moneyline') {
      return betType === 'home' ? bet.game.homeTeam : bet.game.awayTeam;
    }
    
    if (marketType === 'spread') {
      const team = betType === 'spread-home' ? bet.game.homeTeam : bet.game.awayTeam;
      const spreadValue = line || 0;
      return `${team} ${spreadValue > 0 ? '+' : ''}${spreadValue}`;
    }
    
    if (marketType === 'total') {
      return `${betType === 'over' ? 'Over' : 'Under'} ${line}`;
    }
    
    return betType;
  };

  const getMarketLabel = (marketType?: string) => {
    switch (marketType) {
      case 'moneyline':
        return 'Moneyline';
      case 'spread':
        return 'Spread';
      case 'total':
        return 'Total';
      default:
        return 'Bet';
    }
  };

  const formatOdds = (odds: number) => {
    // Convert decimal odds to American odds for display
    if (odds >= 2.0) {
      return `+${Math.round((odds - 1) * 100)}`;
    } else {
      return `${Math.round(-100 / (odds - 1))}`;
    }
  };

  const BetCard = ({ bet }: { bet: typeof bets[0] }) => {
    const isSettled = bet.status !== 'pending';
    const hasGameResult = bet.game.status === 'final' && bet.game.homeScore !== undefined && bet.game.awayScore !== undefined;

    return (
      <Card className="bg-[#1C2128] border-[#2A2F36] hover:border-[#3A3F46] transition-colors">
        <CardContent className="p-5">
          {/* Header with Sport and Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#0F1419] text-white border-[#2A2F36] text-xs">
                {bet.game.sport}
              </Badge>
              <span className="text-[#8B949E] text-xs">•</span>
              <span className="text-[#8B949E] text-xs">{getMarketLabel(bet.marketType)}</span>
            </div>
            <Badge
              className={
                bet.status === 'won'
                  ? 'bg-[#00C853] text-white hover:bg-[#00C853]'
                  : bet.status === 'lost'
                  ? 'bg-[#FF3B30] text-white hover:bg-[#FF3B30]'
                  : 'bg-[#FFB800] text-white hover:bg-[#FFB800]'
              }
            >
              {bet.status === 'won' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {bet.status === 'lost' && <XCircle className="h-3 w-3 mr-1" />}
              {bet.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {bet.status.toUpperCase()}
            </Badge>
          </div>

          {/* Bet Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-lg">{getBetDescription(bet)}</span>
              <span className="text-white font-mono font-bold">{formatOdds(bet.odds)}</span>
            </div>
            <p className="text-[#8B949E] text-sm">
              {bet.game.homeTeam} vs {bet.game.awayTeam}
            </p>
          </div>

          {/* Wager Info */}
          <div className="flex items-center justify-between py-3 border-t border-[#2A2F36]">
            <span className="text-[#8B949E] text-sm">Wager: ${bet.stake.toFixed(2)}</span>
            {isSettled && bet.payout && bet.payout > 0 && (
              <span className="text-[#00C853] font-bold">Paid: ${bet.payout.toFixed(2)}</span>
            )}
          </div>

          {/* Game Result */}
          {hasGameResult && (
            <div className="mt-4 pt-4 border-t border-[#2A2F36]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{bet.game.homeTeam}</span>
                    <span className="text-white font-bold text-xl">{bet.game.homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{bet.game.awayTeam}</span>
                    <span className="text-white font-bold text-xl">{bet.game.awayScore}</span>
                  </div>
                </div>
              </div>

              {/* Period Scores */}
              {bet.game.periodScores && (
                <div className="mt-3 pt-3 border-t border-[#2A2F36]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[#8B949E]">{bet.game.homeTeam}</span>
                    <div className="flex gap-2">
                      {bet.game.periodScores.home.map((score, idx) => (
                        <span key={idx} className="text-[#8B949E] w-6 text-center">{score}</span>
                      ))}
                      <span className="text-white font-bold w-8 text-center border-l border-[#2A2F36] pl-2">
                        {bet.game.homeScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B949E]">{bet.game.awayTeam}</span>
                    <div className="flex gap-2">
                      {bet.game.periodScores.away.map((score, idx) => (
                        <span key={idx} className="text-[#8B949E] w-6 text-center">{score}</span>
                      ))}
                      <span className="text-white font-bold w-8 text-center border-l border-[#2A2F36] pl-2">
                        {bet.game.awayScore}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Time */}
              {bet.game.completedAt && (
                <p className="text-[#8B949E] text-xs mt-3">
                  Final Score • {formatDate(bet.game.completedAt)}
                </p>
              )}
            </div>
          )}

          {/* Placement Time */}
          {!hasGameResult && (
            <p className="text-[#8B949E] text-xs mt-3">
              Placed: {formatDate(bet.placedAt || bet.timestamp.toISOString())}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <Navbar onHomeClick={handleHomeClick} isHomeActive={false} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My Bets</h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#1C2128] border-[#2A2F36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#8B949E] text-sm">Total Bets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white text-3xl font-bold">{bets.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1C2128] border-[#2A2F36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#8B949E] text-sm">Won</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#00C853] text-3xl font-bold">{wonBets.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1C2128] border-[#2A2F36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#8B949E] text-sm">Lost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#FF3B30] text-3xl font-bold">{lostBets.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1C2128] border-[#2A2F36]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#8B949E] text-sm">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-bold ${
                  netProfit >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'
                }`}
              >
                ${netProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bets List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-[#1C2128] border border-[#2A2F36]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#00C853]">
              All ({bets.length})
            </TabsTrigger>
            <TabsTrigger value="open" className="data-[state=active]:bg-[#00C853]">
              Open ({pendingBets.length})
            </TabsTrigger>
            <TabsTrigger value="settled" className="data-[state=active]:bg-[#00C853]">
              Settled ({wonBets.length + lostBets.length})
            </TabsTrigger>
            <TabsTrigger value="won" className="data-[state=active]:bg-[#00C853]">
              Won ({wonBets.length})
            </TabsTrigger>
            <TabsTrigger value="lost" className="data-[state=active]:bg-[#00C853]">
              Lost ({lostBets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bets.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No bets yet</p>
                <p className="text-[#8B949E] text-sm mt-2">Start betting to see your history here!</p>
              </div>
            ) : (
              bets.map((bet) => <BetCard key={bet.id} bet={bet} />)
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            {pendingBets.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No open bets</p>
              </div>
            ) : (
              pendingBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
            )}
          </TabsContent>

          <TabsContent value="settled" className="space-y-4">
            {wonBets.length + lostBets.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No settled bets</p>
              </div>
            ) : (
              [...wonBets, ...lostBets].map((bet) => <BetCard key={bet.id} bet={bet} />)
            )}
          </TabsContent>

          <TabsContent value="won" className="space-y-4">
            {wonBets.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No winning bets yet</p>
              </div>
            ) : (
              wonBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
            )}
          </TabsContent>

          <TabsContent value="lost" className="space-y-4">
            {lostBets.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No losing bets</p>
              </div>
            ) : (
              lostBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}