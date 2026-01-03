import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBetting } from '@/contexts/BettingContext';
import { useMessages } from '@/contexts/MessagesContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayMoney from '@/components/PlayMoney';

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

interface Message {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function Admin() {
  const { user, users } = useAuth();
  const { getAllUserBets } = useBetting();
  const { messages, unreadCount, markAsRead } = useMessages();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  if (!user || user.email !== 'fzhangj2ee@gmail.com') {
    navigate('/');
    return null;
  }

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
      email: u.email || '',
      balance: 0,
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

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f10]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {!selectedUser ? (
          <Tabs defaultValue="users" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <TabsList className="bg-[#1a1d1f]">
                <TabsTrigger value="users" className="data-[state=active]:bg-[#2a2d2f]">
                  Users
                </TabsTrigger>
                <TabsTrigger value="messages" className="data-[state=active]:bg-[#2a2d2f]">
                  Messages
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="users">
              <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
                <CardHeader>
                  <CardTitle className="text-white">All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2a2d2f] hover:bg-[#2a2d2f]">
                        <TableHead className="text-[#b1bad3]">Email</TableHead>
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
                          <TableCell className="text-white">{stats.totalBets}</TableCell>
                          <TableCell className="text-green-400">{stats.wins}</TableCell>
                          <TableCell className="text-red-400">{stats.losses}</TableCell>
                          <TableCell className="text-yellow-400">{stats.pending}</TableCell>
                          <TableCell className={stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                            <PlayMoney amount={stats.netProfit} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="bg-[#1a1d1f] border-[#2a2d2f]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>User Messages</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive">{unreadCount} Unread</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <p className="text-[#b1bad3] text-center py-8">No messages yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#2a2d2f] hover:bg-[#2a2d2f]">
                          <TableHead className="w-12"></TableHead>
                          <TableHead className="text-[#b1bad3]">User</TableHead>
                          <TableHead className="text-[#b1bad3]">Email</TableHead>
                          <TableHead className="text-[#b1bad3]">Message Preview</TableHead>
                          <TableHead className="text-[#b1bad3]">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow
                            key={message.id}
                            className="border-[#2a2d2f] hover:bg-[#2a2d2f] cursor-pointer"
                            onClick={() => handleMessageClick(message)}
                          >
                            <TableCell>
                              {message.read ? (
                                <MailOpen className="w-4 h-4 text-[#b1bad3]" />
                              ) : (
                                <Mail className="w-4 h-4 text-green-500" />
                              )}
                            </TableCell>
                            <TableCell className={`font-medium ${!message.read ? 'text-white' : 'text-[#b1bad3]'}`}>
                              {message.user_name}
                            </TableCell>
                            <TableCell className={!message.read ? 'text-white' : 'text-[#b1bad3]'}>
                              {message.user_email}
                            </TableCell>
                            <TableCell className={`max-w-md truncate ${!message.read ? 'text-white' : 'text-[#b1bad3]'}`}>
                              {message.content.substring(0, 50)}...
                            </TableCell>
                            <TableCell className="text-[#b1bad3]">
                              {new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <PlayMoney 
                    amount={selectedUserStats?.netProfit || 0}
                    className={`text-2xl font-bold ${selectedUserStats && selectedUserStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  />
                </CardContent>
              </Card>
            </div>

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
                          <TableCell className="text-white"><PlayMoney amount={bet.stake} /></TableCell>
                          <TableCell className="text-green-400">
                            <PlayMoney amount={bet.stake * bet.odds} />
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

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Message from {selectedMessage?.user_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-[#b1bad3]">From:</div>
              <div className="text-white">{selectedMessage?.user_email}</div>
            </div>
            <div>
              <div className="text-sm text-[#b1bad3]">Date:</div>
              <div className="text-white">
                {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#b1bad3]">Message:</div>
              <div className="text-white whitespace-pre-wrap mt-2 p-4 bg-[#1a1d1f] rounded-lg border border-[#2a2d2f]">
                {selectedMessage?.content}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}