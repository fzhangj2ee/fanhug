import { useBetting } from '@/contexts/BettingContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function MyBets() {
  const { bets, settleBet } = useBetting();

  const pendingBets = bets.filter((bet) => bet.status === 'pending');
  const wonBets = bets.filter((bet) => bet.status === 'won');
  const lostBets = bets.filter((bet) => bet.status === 'lost');

  const totalWon = wonBets.reduce((sum, bet) => sum + bet.potentialWin, 0);
  const totalLost = lostBets.reduce((sum, bet) => sum + bet.stake, 0);
  const netProfit = totalWon - totalLost;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const BetCard = ({ bet }: { bet: typeof bets[0] }) => (
    <Card className="bg-[#1C2128] border-[#2A2F36]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <Badge variant="secondary" className="bg-[#0F1419] text-white border-[#2A2F36] mb-2">
              {bet.game.sport}
            </Badge>
            <p className="text-white font-medium">
              {bet.game.homeTeam} vs {bet.game.awayTeam}
            </p>
            <p className="text-[#8B949E] text-sm">
              Bet on: {bet.betType === 'home' ? bet.game.homeTeam : bet.betType === 'away' ? bet.game.awayTeam : 'Draw'}
            </p>
          </div>
          <Badge
            className={
              bet.status === 'won'
                ? 'bg-[#00C853] text-white'
                : bet.status === 'lost'
                ? 'bg-[#FF3B30] text-white'
                : 'bg-[#FFB800] text-white'
            }
          >
            {bet.status === 'won' && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {bet.status === 'lost' && <XCircle className="h-3 w-3 mr-1" />}
            {bet.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
            {bet.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#8B949E]">Stake</p>
            <p className="text-white font-bold">${bet.stake.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[#8B949E]">Odds</p>
            <p className="text-white font-mono font-bold">{bet.odds.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[#8B949E]">Potential Win</p>
            <p className="text-[#00C853] font-bold">${bet.potentialWin.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[#8B949E]">Placed</p>
            <p className="text-white text-xs">{formatDate(bet.placedAt)}</p>
          </div>
        </div>

        {bet.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => settleBet(bet.id, true)}
              className="flex-1 bg-[#00C853] hover:bg-[#00E676] text-white"
              size="sm"
            >
              Mark as Won
            </Button>
            <Button
              onClick={() => settleBet(bet.id, false)}
              className="flex-1 bg-[#FF3B30] hover:bg-[#FF5C54] text-white"
              size="sm"
            >
              Mark as Lost
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <Navbar />

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
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#00C853]">
              Pending ({pendingBets.length})
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

          <TabsContent value="pending" className="space-y-4">
            {pendingBets.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No pending bets</p>
              </div>
            ) : (
              pendingBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
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