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
  const { addFunds, placeBet, balance } = useWallet();
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
      
      setAllPlacedBets(bets);
      console.log('Loaded bets from Supabase:', bets.length);
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
        const userBets = Array.isArray(parsed) ? parsed.filter((bet: PlacedBet) => bet.userId === user.id) : [];
        
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

  // Get current user's bets with safety check
  const placedBets = user && Array.isArray(allPlacedBets) 
    ? allPlacedBets.filter(bet => bet.userId === user.id) 
    : [];

  // Grade pending bets by checking completed games
  const gradePendingBets = useCallback(async () => {
    if (!user || !Array.isArray(allPlacedBets)) return;
    
    try {
      // Fetch all completed games from Odds API
      const completedGames = await fetchAllCompletedGames();
      
      // Get all pending bets
      const pendingBets = allPlacedBets.filter(bet => bet.status === 'pending');
      
      if (pendingBets.length === 0) return;
      
      console.log(`Grading ${pendingBets.length} pending bets against ${completedGames.size} completed games`);
      
      let hasUpdates = false;
      const updatedBets = [...allPlacedBets];
      
      for (let i = 0; i < updatedBets.length; i++) {
        const bet = updatedBets[i];
        if (bet.status !== 'pending') continue;
        
        // Check if this bet's game is completed
        const completedGame = completedGames.get(bet.game.id);
        
        // CRITICAL: Only grade if game is truly completed with valid scores
        if (!completedGame || 
            completedGame.status !== 'final' ||
            completedGame.homeScore === undefined || 
            completedGame.awayScore === undefined) {
          console.log(`Bet ${bet.id}: Game ${bet.game.id} not completed yet`);
          continue;
        }
        
        console.log(`Grading bet ${bet.id} for game ${bet.game.homeTeam} vs ${bet.game.awayTeam}: ${completedGame.homeScore}-${completedGame.awayScore}`);
        
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
        
        console.log(`Bet ${bet.id} result: ${won ? 'WON' : 'LOST'}, payout: $${payout.toFixed(2)}`);
        
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
        console.log('Bet grading completed with updates');
      } else {
        console.log('No bets were graded in this cycle');
      }
    } catch (error) {
      console.error('Error grading bets:', error);
    }
  }, [allPlacedBets, addFunds, user]);

  // Set up automatic grading every 2 minutes (reduced frequency)
  useEffect(() => {
    if (!user) return;
    
    // Grade bets immediately on mount
    gradePendingBets();
    
    // Set up interval to grade bets every 2 minutes instead of 1 minute
    const intervalId = setInterval(() => {
      gradePendingBets();
    }, 120000); // 120 seconds = 2 minutes
    
    return () => clearInterval(intervalId);
  }, [gradePendingBets, user]);

  const addToBetSlip = (game: Game, betType: BetSlipItem['betType'], odds: number, value?: number) => {
    if (!user) {
      toast.error('Please login to place bets');
      return;
    }

    // Only block betting on completed/finished games
    if (game.status === 'final' || game.status === 'completed' || game.status === 'cancelled' || game.status === 'postponed') {
      toast.error('Cannot bet on completed or cancelled games');
      return;
    }
    
    // Also check if game has final scores (indicates completion)
    if (game.homeScore !== undefined && game.awayScore !== undefined && !game.isLive) {
      toast.error('This game has finished');
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
    const safeBetSlip = Array.isArray(betSlip) ? betSlip : [];
    const existingBetIndex = safeBetSlip.findIndex(item => item.game.id === game.id);
    
    if (existingBetIndex !== -1) {
      // Replace the existing bet for this game
      const updatedBetSlip = [...safeBetSlip];
      updatedBetSlip[existingBetIndex] = newBet;
      setBetSlip(updatedBetSlip);
    } else {
      // Append the new bet to the end of the bet slip
      setBetSlip([...safeBetSlip, newBet]);
    }

    toast.success('Added to bet slip');
  };

  const removeFromBetSlip = (gameId: string) => {
    const safeBetSlip = Array.isArray(betSlip) ? betSlip : [];
    setBetSlip(safeBetSlip.filter((item) => item.game.id !== gameId));
  };

  const updateStake = (gameId: string, stake: number) => {
    const safeBetSlip = Array.isArray(betSlip) ? betSlip : [];
    setBetSlip(
      safeBetSlip.map((item) =>
        item.game.id === gameId ? { ...item, stake } : item
      )
    );
  };

  const placeBets = async (): Promise<boolean> => {
    console.log('=== PLACE BETS START ===');
    console.log('User:', user?.id);
    
    // Safety check for betSlip
    const safeBetSlip = Array.isArray(betSlip) ? betSlip : [];
    console.log('Bet slip length:', safeBetSlip.length);
    
    if (!user) {
      console.log('ERROR: No user logged in');
      toast.error('Please login to place bets');
      return false;
    }

    if (safeBetSlip.length === 0) {
      console.log('ERROR: Bet slip is empty');
      toast.error('No bets in slip');
      return false;
    }

    // Validate that games are not completed/finished
    const invalidBets = safeBetSlip.filter(item => {
      // Block only completed, cancelled, or postponed games
      const isCompleted = item.game.status === 'final' || 
                         item.game.status === 'completed' || 
                         item.game.status === 'cancelled' || 
                         item.game.status === 'postponed';
      
      // Also check if game has final scores but is not live
      const hasFinishedScores = item.game.homeScore !== undefined && 
                               item.game.awayScore !== undefined && 
                               !item.game.isLive;
      
      return isCompleted || hasFinishedScores;
    });
    
    if (invalidBets.length > 0) {
      console.log('ERROR: Some games have finished or been cancelled');
      toast.error('Cannot bet on completed or cancelled games. Please remove them from your bet slip.');
      return false;
    }

    // Check if all bets have valid stakes
    const zeroStakeBets = safeBetSlip.filter((item) => item.stake <= 0);
    if (zeroStakeBets.length > 0) {
      console.log('ERROR: Invalid stakes found:', zeroStakeBets);
      toast.error('Please enter valid stake amounts for all bets');
      return false;
    }

    // Calculate total stake amount with safety check
    const totalStake = safeBetSlip.reduce((sum, item) => sum + (Number(item.stake) || 0), 0);
    console.log('Total stake calculated:', totalStake);
    
    // Create bet description
    const betDescription = safeBetSlip.length === 1 
      ? `Bet on ${safeBetSlip[0].game.homeTeam} vs ${safeBetSlip[0].game.awayTeam}`
      : `${safeBetSlip.length} bets placed`;
    console.log('Bet description:', betDescription);
    
    // Deduct balance from wallet first
    console.log('Calling placeBet with amount:', totalStake);
    
    try {
      const balanceDeducted = placeBet(totalStake, betDescription);
      console.log('placeBet returned:', balanceDeducted);
      
      if (!balanceDeducted) {
        console.log('ERROR: Balance deduction failed. Insufficient balance.');
        toast.error(`Insufficient balance. You have $${balance.toFixed(2)} but need $${totalStake.toFixed(2)}`);
        return false;
      }
      
      console.log('Balance deducted successfully.');
    } catch (error) {
      console.error('ERROR: Exception during placeBet call:', error);
      toast.error('Failed to deduct balance. Please try again.');
      return false;
    }

    // Convert bet slip items to placed bets
    const newPlacedBets: PlacedBet[] = safeBetSlip.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      userId: user.id,
      placedAt: new Date(),
      status: 'pending',
    }));
    console.log('Created', newPlacedBets.length, 'new placed bets');

    try {
      console.log('Saving bets to Supabase...');
      // Save all bets to Supabase
      for (const bet of newPlacedBets) {
        await saveBetToSupabase(bet);
      }
      console.log('All bets saved to Supabase successfully');
      
      // Update local state immediately
      const safeAllPlacedBets = Array.isArray(allPlacedBets) ? allPlacedBets : [];
      const updatedBets = [...safeAllPlacedBets, ...newPlacedBets];
      setAllPlacedBets(updatedBets);
      console.log('Local state updated. Total bets now:', updatedBets.length);
      
      // Save current bet slip as recently placed bets
      setRecentlyPlacedBets([...safeBetSlip]);
      console.log('Recently placed bets saved');
      
      // Clear bet slip for new bets
      setBetSlip([]);
      console.log('Bet slip cleared');
      
      console.log('=== PLACE BETS SUCCESS ===');
      return true;
    } catch (error) {
      console.error('ERROR: Failed to save bets to Supabase:', error);
      // If saving to Supabase fails, refund the balance
      console.log('Refunding balance:', totalStake);
      addFunds(totalStake);
      toast.error('Failed to place bets. Your balance has been refunded.');
      console.log('=== PLACE BETS FAILED ===');
      return false;
    }
  };

  const clearBetSlip = () => {
    setBetSlip([]);
  };

  const getAllUserBets = (userId: string): PlacedBet[] => {
    const safeAllPlacedBets = Array.isArray(allPlacedBets) ? allPlacedBets : [];
    return safeAllPlacedBets.filter(bet => bet.userId === userId);
  };

  const value = {
    betSlip: Array.isArray(betSlip) ? betSlip : [],
    placedBets,
    recentlyPlacedBets: Array.isArray(recentlyPlacedBets) ? recentlyPlacedBets : [],
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