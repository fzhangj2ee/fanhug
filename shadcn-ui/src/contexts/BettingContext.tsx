import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Game } from '@/types/betting';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/contexts/WalletContext';
import { fetchAllCompletedGames } from '@/lib/sportsApi';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BetSlipItem {
  game: Game;
  betType: 'home' | 'away' | 'spread-home' | 'spread-away' | 'over' | 'under';
  odds: number;
  stake: number;
  spreadValue?: number;
  totalValue?: number;
}

interface PlacedBet extends BetSlipItem {
  id: string;
  userId: string;
  placedAt: Date;
  status: 'pending' | 'won' | 'lost';
  result?: 'won' | 'lost';
  payout?: number;
}

interface BettingContextType {
  betSlip: BetSlipItem[];
  placedBets: PlacedBet[];
  recentlyPlacedBets: BetSlipItem[];
  addToBetSlip: (game: Game, betType: BetSlipItem['betType'], odds: number, value?: number) => void;
  removeFromBetSlip: (gameId: string) => void;
  updateStake: (gameId: string, stake: number) => void;
  placeBets: () => Promise<boolean>;
  clearBetSlip: () => void;
  getAllUserBets: (userId: string) => PlacedBet[];
  gradePendingBets: () => Promise<void>;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export function BettingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addFunds } = useWallet();
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [allPlacedBets, setAllPlacedBets] = useState<PlacedBet[]>([]);
  const [recentlyPlacedBets, setRecentlyPlacedBets] = useState<BetSlipItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load bets from Supabase
  const loadBetsFromSupabase = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });
      
      if (error) {
        console.error('Error loading bets:', error);
        return;
      }
      
      const bets: PlacedBet[] = data.map(bet => ({
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
      
      setAllPlacedBets(bets);
    } catch (error) {
      console.error('Error loading bets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save bet to Supabase
  const saveBetToSupabase = async (bet: PlacedBet) => {
    const { error } = await supabase
      .from('bets')
      .insert({
        id: bet.id,
        user_id: bet.userId,
        game_id: bet.game.id,
        game_data: bet.game,
        bet_type: bet.betType,
        odds: bet.odds,
        stake: bet.stake,
        spread_value: bet.spreadValue,
        total_value: bet.totalValue,
        status: bet.status,
        payout: bet.payout,
        placed_at: bet.placedAt.toISOString(),
      });
    
    if (error) {
      console.error('Error saving bet:', error);
      throw error;
    }
  };

  // Update bet in Supabase
  const updateBetInSupabase = async (betId: string, updates: { status: PlacedBet['status']; payout?: number }) => {
    const { error } = await supabase
      .from('bets')
      .update({
        status: updates.status,
        payout: updates.payout,
      })
      .eq('id', betId);
    
    if (error) {
      console.error('Error updating bet:', error);
      throw error;
    }
  };

  // Migrate localStorage data to Supabase (one-time)
  useEffect(() => {
    const migrateLocalStorageToSupabase = async () => {
      if (!user) return;
      
      const migrated = localStorage.getItem('supabase_migration_done');
      if (migrated) return;
      
      const savedBets = localStorage.getItem('all_placed_bets');
      if (!savedBets) {
        localStorage.setItem('supabase_migration_done', 'true');
        return;
      }
      
      try {
        const parsed = JSON.parse(savedBets);
        const userBets = parsed.filter((bet: PlacedBet) => bet.userId === user.id);
        
        if (userBets.length === 0) {
          localStorage.setItem('supabase_migration_done', 'true');
          return;
        }
        
        console.log(`Migrating ${userBets.length} bets to Supabase...`);
        
        for (const bet of userBets) {
          try {
            await saveBetToSupabase({
              ...bet,
              placedAt: new Date(bet.placedAt),
            });
          } catch (error) {
            console.error('Error migrating bet:', error);
          }
        }
        
        localStorage.setItem('supabase_migration_done', 'true');
        toast.success('Your betting history has been migrated to the cloud!');
        
        // Reload bets from Supabase
        await loadBetsFromSupabase();
      } catch (error) {
        console.error('Migration error:', error);
      }
    };
    
    migrateLocalStorageToSupabase();
  }, [user, loadBetsFromSupabase]);

  // Load bets from Supabase when user changes
  useEffect(() => {
    if (user) {
      loadBetsFromSupabase();
    } else {
      setAllPlacedBets([]);
    }
  }, [user, loadBetsFromSupabase]);

  // Get current user's bets
  const placedBets = user ? allPlacedBets.filter(bet => bet.userId === user.id) : [];

  // Grade pending bets by checking completed games
  const gradePendingBets = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch all completed games from Odds API
      const completedGames = await fetchAllCompletedGames();
      
      // Get all pending bets
      const pendingBets = allPlacedBets.filter(bet => bet.status === 'pending');
      
      if (pendingBets.length === 0) return;
      
      let hasUpdates = false;
      const updatedBets = [...allPlacedBets];
      
      for (let i = 0; i < updatedBets.length; i++) {
        const bet = updatedBets[i];
        if (bet.status !== 'pending') continue;
        
        // Check if this bet's game is completed
        const completedGame = completedGames.get(bet.game.id);
        if (!completedGame || completedGame.homeScore === undefined || completedGame.awayScore === undefined) {
          continue;
        }
        
        // Determine if bet won based on bet type
        let won = false;
        
        if (bet.betType === 'home') {
          won = completedGame.homeScore > completedGame.awayScore;
        } else if (bet.betType === 'away') {
          won = completedGame.awayScore > completedGame.homeScore;
        } else if (bet.betType === 'spread-home' && bet.spreadValue !== undefined) {
          won = (completedGame.homeScore + bet.spreadValue) > completedGame.awayScore;
        } else if (bet.betType === 'spread-away' && bet.spreadValue !== undefined) {
          won = (completedGame.awayScore + bet.spreadValue) > completedGame.homeScore;
        } else if (bet.betType === 'over' && bet.totalValue !== undefined) {
          won = (completedGame.homeScore + completedGame.awayScore) > bet.totalValue;
        } else if (bet.betType === 'under' && bet.totalValue !== undefined) {
          won = (completedGame.homeScore + completedGame.awayScore) < bet.totalValue;
        }
        
        // Calculate payout for winning bets
        const payout = won ? bet.stake * bet.odds : 0;
        
        // Update bet status
        updatedBets[i] = {
          ...bet,
          status: won ? 'won' : 'lost',
          payout: won ? payout : undefined,
        };
        
        // Update in Supabase
        try {
          await updateBetInSupabase(bet.id, {
            status: won ? 'won' : 'lost',
            payout: won ? payout : undefined,
          });
          
          // Update wallet for winning bets
          if (won) {
            addFunds(payout);
            toast.success(`Bet won! +$${payout.toFixed(2)} added to your balance`);
          }
          
          hasUpdates = true;
        } catch (error) {
          console.error('Error updating bet in Supabase:', error);
        }
      }
      
      if (hasUpdates) {
        setAllPlacedBets(updatedBets);
      }
    } catch (error) {
      console.error('Error grading bets:', error);
    }
  }, [allPlacedBets, addFunds, user]);

  // Set up automatic grading every 60 seconds
  useEffect(() => {
    if (!user) return;
    
    // Grade bets immediately on mount
    gradePendingBets();
    
    // Set up interval to grade bets every 60 seconds
    const intervalId = setInterval(() => {
      gradePendingBets();
    }, 60000); // 60 seconds
    
    return () => clearInterval(intervalId);
  }, [gradePendingBets, user]);

  const addToBetSlip = (game: Game, betType: BetSlipItem['betType'], odds: number, value?: number) => {
    if (!user) {
      toast.error('Please login to place bets');
      return;
    }

    const newBet: BetSlipItem = {
      game,
      betType,
      odds,
      stake: 0,
      spreadValue: betType.includes('spread') ? value : undefined,
      totalValue: betType === 'over' || betType === 'under' ? value : undefined,
    };

    // Check if a bet for this game already exists
    const existingBetIndex = betSlip.findIndex(item => item.game.id === game.id);
    
    if (existingBetIndex !== -1) {
      // Replace the existing bet for this game
      const updatedBetSlip = [...betSlip];
      updatedBetSlip[existingBetIndex] = newBet;
      setBetSlip(updatedBetSlip);
    } else {
      // Append the new bet to the end of the bet slip
      setBetSlip([...betSlip, newBet]);
    }

    toast.success('Added to bet slip');
  };

  const removeFromBetSlip = (gameId: string) => {
    setBetSlip(betSlip.filter((item) => item.game.id !== gameId));
  };

  const updateStake = (gameId: string, stake: number) => {
    setBetSlip(
      betSlip.map((item) =>
        item.game.id === gameId ? { ...item, stake } : item
      )
    );
  };

  const placeBets = async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please login to place bets');
      return false;
    }

    if (betSlip.length === 0) {
      toast.error('No bets in slip');
      return false;
    }

    // Check if all bets have valid stakes
    const invalidBets = betSlip.filter((item) => item.stake <= 0);
    if (invalidBets.length > 0) {
      toast.error('Please enter valid stake amounts for all bets');
      return false;
    }

    // Convert bet slip items to placed bets
    const newPlacedBets: PlacedBet[] = betSlip.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      userId: user.id,
      placedAt: new Date(),
      status: 'pending',
    }));

    try {
      // Save all bets to Supabase
      for (const bet of newPlacedBets) {
        await saveBetToSupabase(bet);
      }
      
      setAllPlacedBets([...allPlacedBets, ...newPlacedBets]);
      
      // Save current bet slip as recently placed bets
      setRecentlyPlacedBets([...betSlip]);
      
      // Clear bet slip for new bets
      setBetSlip([]);
      
      return true;
    } catch (error) {
      console.error('Error placing bets:', error);
      toast.error('Failed to place bets. Please try again.');
      return false;
    }
  };

  const clearBetSlip = () => {
    setBetSlip([]);
  };

  const getAllUserBets = (userId: string): PlacedBet[] => {
    return allPlacedBets.filter(bet => bet.userId === userId);
  };

  const value = {
    betSlip,
    placedBets,
    recentlyPlacedBets,
    addToBetSlip,
    removeFromBetSlip,
    updateStake,
    placeBets,
    clearBetSlip,
    getAllUserBets,
    gradePendingBets,
  };

  return <BettingContext.Provider value={value}>{children}</BettingContext.Provider>;
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (context === undefined) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
}