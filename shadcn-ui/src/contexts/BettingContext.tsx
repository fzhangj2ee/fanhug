import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Game } from '@/types/betting';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/contexts/WalletContext';
import { fetchAllCompletedGames } from '@/lib/sportsApi';
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
  placeBets: () => boolean;
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

  // Load all placed bets from localStorage on mount
  useEffect(() => {
    const savedBets = localStorage.getItem('all_placed_bets');
    if (savedBets) {
      const parsed = JSON.parse(savedBets);
      // Convert date strings back to Date objects
      const betsWithDates = parsed.map((bet: PlacedBet) => ({
        ...bet,
        placedAt: new Date(bet.placedAt),
      }));
      setAllPlacedBets(betsWithDates);
    }
  }, []);

  // Save all placed bets to localStorage whenever they change
  useEffect(() => {
    if (allPlacedBets.length > 0) {
      localStorage.setItem('all_placed_bets', JSON.stringify(allPlacedBets));
    }
  }, [allPlacedBets]);

  // Get current user's bets
  const placedBets = user ? allPlacedBets.filter(bet => bet.userId === user.id) : [];

  // Grade pending bets by checking completed games
  const gradePendingBets = useCallback(async () => {
    try {
      // Fetch all completed games from Odds API
      const completedGames = await fetchAllCompletedGames();
      
      // Get all pending bets
      const pendingBets = allPlacedBets.filter(bet => bet.status === 'pending');
      
      if (pendingBets.length === 0) return;
      
      let hasUpdates = false;
      const updatedBets = allPlacedBets.map(bet => {
        if (bet.status !== 'pending') return bet;
        
        // Check if this bet's game is completed
        const completedGame = completedGames.get(bet.game.id);
        if (!completedGame || completedGame.homeScore === undefined || completedGame.awayScore === undefined) {
          return bet;
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
        
        // Update wallet for winning bets
        if (won) {
          addFunds(payout);
          toast.success(`Bet won! +${payout.toFixed(2)} added to your balance`);
        }
        
        hasUpdates = true;
        
        return {
          ...bet,
          status: won ? 'won' : 'lost',
          payout: won ? payout : undefined,
        } as PlacedBet;
      });
      
      if (hasUpdates) {
        setAllPlacedBets(updatedBets);
      }
    } catch (error) {
      console.error('Error grading bets:', error);
    }
  }, [allPlacedBets, addFunds]);

  // Set up automatic grading every 60 seconds
  useEffect(() => {
    // Grade bets immediately on mount
    gradePendingBets();
    
    // Set up interval to grade bets every 60 seconds
    const intervalId = setInterval(() => {
      gradePendingBets();
    }, 60000); // 60 seconds
    
    return () => clearInterval(intervalId);
  }, [gradePendingBets]);

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

  const placeBets = (): boolean => {
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
      id: `${item.game.id}-${Date.now()}-${Math.random()}`,
      userId: user.id,
      placedAt: new Date(),
      status: 'pending',
    }));

    setAllPlacedBets([...allPlacedBets, ...newPlacedBets]);
    
    // Save current bet slip as recently placed bets
    setRecentlyPlacedBets([...betSlip]);
    
    // Clear bet slip for new bets
    setBetSlip([]);
    
    return true;
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