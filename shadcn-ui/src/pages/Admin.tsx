import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBetting } from '@/contexts/BettingContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserStats {
  email: string;
  balance: number;
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
}

export default function Admin() {
  const { user, users } = useAuth();
  const { getAllUserBets } = useBetting();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Check if user is admin
  if (!user || user.email !== 'fzhangj2ee@gmail.com') {
    navigate('/');
    return null;
  }

  const handleHomeClick = () => {
    navigate('/');
  };

  // Calculate stats for all users
  const userStats: UserStats[] = users.map((u) => {
    const userBets = getAllUserBets(u.id);
    const wins = userBets.filter(bet => bet.status === 'won').length;
    const losses = userBets.filter(bet => bet.status === 'lost').length;
    const pending = userBets.filter(bet => bet.status === 'pending').length;
    const totalWagered = userBets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalWon = userBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + (bet.payout || 0), 0);
    const netProfit = totalWon - userBets.filter(bet => bet.status === 'lost').reduce((sum, bet) => sum + bet.stake, 0);

    return {
      email: u.email,
      balance: u.balance || 0,
      totalBets: userBets.length,
      wins,
      losses,
      pending,
      totalWagered,
      totalWon,
      netProfit,
    };
  });

  const selectedUserData = selectedUser ? users.find(u => u.email === selectedUser) : null;
  const selectedUserBets = selectedUserData ? getAllUserBets(selectedUserData.id) : [];
  const selectedUserStats = userStats.find(s => s.email === selectedUser);

  const formatOdds = (odds: number) => {
    if (odds >= 2.0) {
      return `+${Math.round((odds - 1) * 100)}`;
    } else {
      return `${Math.round(-100 / (odds - 1))}`;
    }
  };

  const getBetDescription = (bet: typeof selectedUserBets[0]) => {
    const { betType, spreadValue, totalValue } = bet;
    
    if (betType === 'home') return bet.game.homeTeam;
    if (betType === 'away') return bet.game.awayTeam;
    if (betType === 'spread-home') return `${bet.game.homeTeam} ${spreadValue && spreadValue > 0 ? '+' : ''}${spreadValue}`;
    if (betType === 'spread-away') return `${bet.game.awayTeam} ${spreadValue && spreadValue > 0 ? '+' : ''}${spreadValue}`;
    if (betType === 'over') return `Over ${totalValue}`;
    if (betType === 'under') return `Under ${totalValue}`;
    
    return betType;
  };

  return (
    <div className="min-h-screen bg-[#0d0f10]">
      <Navbar onHomeClick={handleHomeClick} isHomeActive={false} />
      
      <div className="container mx-auto px-4 py-6">
        {!selectedUser ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
            
            <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
              <CardHeader>
                <CardTitle className="text-white">All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2a2d2f] hover:bg-[#2a2d2f]">
                      <TableHead className="text-[#b1bad3]">Email</TableHead>
                      <TableHead className="text-[#b1bad3]">Balance</TableHead>
                      <TableHead className="text-[#b1bad3]">Total Bets</TableHead>
                      <TableHead className="text-[#b1bad3]">Wins</TableHead>
                      <TableHead className="text-[#b1bad3]">Losses</TableHead>
                      <TableHead className="text-[#b1bad3]">Pending</TableHead>
                      <TableHead className="text-[#b1bad3]">Net Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userStats.map((stats) => (
                      <TableRow
                        key={stats.email}
                        className="border-[#2a2d2f] hover:bg-[#2a2d2f] cursor-pointer"
                        onClick={() => setSelectedUser(stats.email)}
                      >
                        <TableCell className="text-white font-medium">{stats.email}</TableCell>
                        <TableCell className="text-white">${stats.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-white">{stats.totalBets}</TableCell>
                        <TableCell className="text-green-400">{stats.wins}</TableCell>
                        <TableCell className="text-red-400">{stats.losses}</TableCell>
                        <TableCell className="text-yellow-400">{stats.pending}</TableCell>
                        <TableCell className={stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${stats.netProfit.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setSelectedUser(null)}
                variant="ghost"
                className="text-white hover:bg-[#1a1d1f]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
              <h1 className="text-3xl font-bold text-white">User Details: {selectedUser}</h1>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
                <CardContent className="p-4">
                  <p className="text-[#b1bad3] text-sm mb-1">Balance</p>
                  <p className="text-white text-2xl font-bold">${selectedUserStats?.balance.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
                <CardContent className="p-4">
                  <p className="text-[#b1bad3] text-sm mb-1">Total Bets</p>
                  <p className="text-white text-2xl font-bold">{selectedUserStats?.totalBets}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <p className="text-green-400 text-sm mb-1">Wins / Losses</p>
                  <p className="text-green-400 text-2xl font-bold">
                    {selectedUserStats?.wins} / <span className="text-red-400">{selectedUserStats?.losses}</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
                <CardContent className="p-4">
                  <p className="text-[#b1bad3] text-sm mb-1">Net Profit</p>
                  <p className={`text-2xl font-bold ${selectedUserStats && selectedUserStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${selectedUserStats?.netProfit.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Bets */}
            <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
              <CardHeader>
                <CardTitle className="text-white">All Bets</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUserBets.length === 0 ? (
                  <p className="text-[#b1bad3] text-center py-8">No bets placed yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2a2d2f] hover:bg-[#2a2d2f]">
                        <TableHead className="text-[#b1bad3]">Game</TableHead>
                        <TableHead className="text-[#b1bad3]">Bet</TableHead>
                        <TableHead className="text-[#b1bad3]">Odds</TableHead>
                        <TableHead className="text-[#b1bad3]">Stake</TableHead>
                        <TableHead className="text-[#b1bad3]">Potential Payout</TableHead>
                        <TableHead className="text-[#b1bad3]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUserBets.map((bet) => (
                        <TableRow key={bet.id} className="border-[#2a2d2f] hover:bg-[#2a2d2f]">
                          <TableCell className="text-white">
                            <div>
                              <p className="font-medium">{bet.game.homeTeam} vs {bet.game.awayTeam}</p>
                              <p className="text-sm text-[#b1bad3]">{bet.game.sport}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{getBetDescription(bet)}</TableCell>
                          <TableCell className="text-white font-mono">{formatOdds(bet.odds)}</TableCell>
                          <TableCell className="text-white">${bet.stake.toFixed(2)}</TableCell>
                          <TableCell className="text-green-400">
                            ${(bet.stake * bet.odds).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                bet.status === 'won'
                                  ? 'bg-green-500/20 text-green-500'
                                  : bet.status === 'lost'
                                  ? 'bg-red-500/20 text-red-500'
                                  : 'bg-yellow-500/20 text-yellow-500'
                              }
                            >
                              {bet.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}