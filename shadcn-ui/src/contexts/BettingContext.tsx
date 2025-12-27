import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Game } from '@/types/betting';
import { useAuth } from '@/hooks/useAuth';
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
  placedAt: Date;
  status: 'pending' | 'won' | 'lost';
  result?: 'won' | 'lost';
}

interface BettingContextType {
  betSlip: BetSlipItem[];
  placedBets: PlacedBet[];
  addToBetSlip: (game: Game, betType: BetSlipItem['betType'], odds: number, value?: number) => void;
  removeFromBetSlip: (gameId: string) => void;
  updateStake: (gameId: string, stake: number) => void;
  placeBets: () => boolean;
  clearBetSlip: () => void;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export function BettingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);

  // Load placed bets from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedBets = localStorage.getItem(`placedBets_${user.id}`);
      if (savedBets) {
        const parsed = JSON.parse(savedBets);
        // Convert date strings back to Date objects
        const betsWithDates = parsed.map((bet: any) => ({
          ...bet,
          placedAt: new Date(bet.placedAt),
        }));
        setPlacedBets(betsWithDates);
      }
    }
  }, [user]);

  // Save placed bets to localStorage whenever they change
  useEffect(() => {
    if (user && placedBets.length > 0) {
      localStorage.setItem(`placedBets_${user.id}`, JSON.stringify(placedBets));
    }
  }, [placedBets, user]);

  const addToBetSlip = (game: Game, betType: BetSlipItem['betType'], odds: number, value?: number) => {
    if (!user) {
      toast.error('Please login to place bets');
      return;
    }

    // Check if bet already exists
    const existingBetIndex = betSlip.findIndex((item) => item.game.id === game.id);

    if (existingBetIndex !== -1) {
      // Update existing bet
      const updatedBetSlip = [...betSlip];
      updatedBetSlip[existingBetIndex] = {
        game,
        betType,
        odds,
        stake: updatedBetSlip[existingBetIndex].stake,
        spreadValue: betType.includes('spread') ? value : undefined,
        totalValue: betType === 'over' || betType === 'under' ? value : undefined,
      };
      setBetSlip(updatedBetSlip);
    } else {
      // Add new bet
      setBetSlip([
        ...betSlip,
        {
          game,
          betType,
          odds,
          stake: 0,
          spreadValue: betType.includes('spread') ? value : undefined,
          totalValue: betType === 'over' || betType === 'under' ? value : undefined,
        },
      ]);
    }
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
      placedAt: new Date(),
      status: 'pending',
    }));

    setPlacedBets([...placedBets, ...newPlacedBets]);
    setBetSlip([]);

    return true;
  };

  const clearBetSlip = () => {
    setBetSlip([]);
  };

  const value = {
    betSlip,
    placedBets,
    addToBetSlip,
    removeFromBetSlip,
    updateStake,
    placeBets,
    clearBetSlip,
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