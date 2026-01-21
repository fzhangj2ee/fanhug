import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/contexts/MessagesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayMoney from '@/components/PlayMoney';
import { supabase } from '@/lib/supabase';
import { Game } from '@/types/betting';

interface PlacedBet {
  id: string;
  userId: string;
  game: Game;
  betType: 'home' | 'away' | 'spread-home' | 'spread-away' | 'over' | 'under';
  odds: number;
  stake: number;
  spreadValue?: number;
  totalValue?: number;
  placedAt: Date;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
}

interface UserStats {
  userId: string;
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
  const { user, users: authUsers } = useAuth();
  const { messages, unreadCount, markAsRead } = useMessages();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [allBets, setAllBets] = useState<PlacedBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch ALL bets from Supabase (admin only)
  useEffect(() => {
    const fetchAllBets = async () => {
      if (!user || user.email !== 'fzhangj2ee@gmail.com') return;
      
      setIsLoading(true);
      try {
        console.log('🔍 [Admin] Fetching ALL bets from Supabase...');
        
        // Fetch ALL bets without user_id filter
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .order('placed_at', { ascending: false });
        
        if (error) {
          console.error('❌ [Admin] Supabase error:', error);
          return;
        }
        
        // 🔍 DEBUG: Print raw data from Supabase IMMEDIATELY after fetch
        console.log('🔍 [Admin Debug] Raw Supabase response - Total bets fetched:', data?.length || 0);
        console.log('🔍 [Admin Debug] Raw data from Supabase:', data);
        
        // Map to PlacedBet objects
        const bets: PlacedBet[] = (data || []).map(bet => ({
          id: bet.id,
          userId: bet.user_id,
          game: bet.game_data as Game,
          betType: bet.bet_type as PlacedBet['betType'],
          odds: Number(bet.odds),
          stake: Number(bet.stake),
          spreadValue: bet.spread_value ? Number(bet.spread_value) : undefined,
          totalValue: bet.total_value ? Number(bet.total_value) : undefined,
          status: bet.status as PlacedBet['status'],
          payout: bet.payout ? Number(bet.payout) : undefined,
          placedAt: new Date(bet.placed_at),
        }));
        
        setAllBets(bets);
        
        const uniqueUsers = [...new Set(bets.map(b => b.userId))];
        console.log(`✅ [Admin] Fetched ${bets.length} bets from ${uniqueUsers.length} unique users`);
        console.log(`✅ [Admin] User IDs: ${JSON.stringify(uniqueUsers)}`);
      } catch (error) {
        console.error('❌ [Admin] Exception fetching bets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllBets();
  }, [user]);

  // Get unique user IDs from all bets
  const uniqueUserIds = useMemo(() => {
    return [...new Set(allBets.map(bet => bet.userId))];
  }, [allBets]);

  // Create a map of user IDs to emails from auth users
  const userIdToEmailMap = useMemo(() => {
    const map = new Map<string, string>();
    authUsers.forEach(u => {
      if (u.id && u.email) {
        map.set(u.id, u.email);
      }
    });
    return map;
  }, [authUsers]);

  // Get bets for a specific user
  const getUserBets = (userId: string): PlacedBet[] => {
    return allBets.filter(bet => bet.userId === userId);
  };

  // Calculate stats for each user who has placed bets
  const userStats: UserStats[] = useMemo(() => {
    return uniqueUserIds.map((userId) => {
      const userBets = getUserBets(userId);
      
      const wins = userBets.filter(bet => bet.status === 'won').length;
      const losses = userBets.filter(bet => bet.status === 'lost').length;
      const pending = userBets.filter(bet => bet.status === 'pending').length;
      const totalWagered = userBets.reduce((sum, bet) => sum + bet.stake, 0);
      const totalWon = userBets
        .filter(bet => bet.status === 'won')
        .reduce((sum, bet) => sum + (bet.payout || 0), 0);
      const netProfit = totalWon - userBets.filter(bet => bet.status === 'lost').reduce((sum, bet) => sum + bet.stake, 0);

      // Try to get email from auth users, otherwise use user ID
      const email = userIdToEmailMap.get(userId) || `User ${userId.substring(0, 8)}...`;

      return {
        userId,
        email,
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
  }, [uniqueUserIds, allBets, userIdToEmailMap]);

  // Check admin access after all hooks
  if (!user || user.email !== 'fzhangj2ee@gmail.com') {
    navigate('/');
    return null;
  }

  const selectedUserBets = selectedUserId ? getUserBets(selectedUserId) : [];
  const selectedUserStats = userStats.find(s => s.userId === selectedUserId);

  const formatOdds = (odds: number) => {
    if (odds >= 2.0) {
      return `+${Math.round((odds - 1) * 100)}`;
    } else {
      return `${Math.round(-100 / (odds - 1))}`;
    }
  };

  const getBetDescription = (bet: PlacedBet) => {
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
      <div className="container mx-auto px-4 py-6">
        {!selectedUserId ? (
          <Tabs defaultValue="users" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <TabsList className="bg-[#1a1d1f]">
                <TabsTrigger value="users" className="data-[state=active]:bg-[#2a2d2f]">
                  Users ({userStats.length})
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
                  <CardTitle className="text-white">All Users with Bets</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-[#b1bad3]">
                      Loading bets...
                    </div>
                  ) : userStats.length === 0 ? (
                    <div className="text-center py-8 text-[#b1bad3]">
                      No users have placed bets yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#2a2d2f] hover:bg-[#2a2d2f]">
                          <TableHead className="text-[#b1bad3]">Email / User ID</TableHead>
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
                            key={stats.userId}
                            className="border-[#2a2d2f] hover:bg-[#2a2d2f] cursor-pointer"
                            onClick={() => setSelectedUserId(stats.userId)}
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
                  )}
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
                onClick={() => setSelectedUserId(null)}
                variant="ghost"
                className="text-white hover:bg-[#1a1d1f]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
              <h1 className="text-3xl font-bold text-white">User Details: {selectedUserStats?.email}</h1>
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