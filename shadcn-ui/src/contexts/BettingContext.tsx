import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bet, Game } from '@/types/betting';
import { useWallet } from './WalletContext';

interface BetSlipItem {
  game: Game;
  betType: 'home' | 'away' | 'spread-home' | 'spread-away' | 'over' | 'under';
  odds: number;
  stake: number;
  spreadValue?: number; // For spread bets
  totalValue?: number; // For over/under bets
}

interface BettingContextType {
  betSlip: BetSlipItem[];
  bets: Bet[];
  addToBetSlip: (game: Game, betType: 'home' | 'away' | 'spread-home' | 'spread-away' | 'over' | 'under', odds: number, value?: number) => void;
  removeFromBetSlip: (gameId: string) => void;
  updateStake: (gameId: string, stake: number) => void;
  placeBets: () => boolean;
  clearBetSlip: () => void;
  settleBet: (betId: string, won: boolean) => void;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export function BettingProvider({ children }: { children: React.ReactNode }) {
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bets');
    return saved ? JSON.parse(saved) : [];
  });
  const { placeBet: deductBalance, settleBet: settleWallet } = useWallet();

  useEffect(() => {
    localStorage.setItem('bets', JSON.stringify(bets));
  }, [bets]);

  const addToBetSlip = (
    game: Game, 
    betType: 'home' | 'away' | 'spread-home' | 'spread-away' | 'over' | 'under', 
    odds: number,
    value?: number
  ) => {
    const existing = betSlip.find((item) => item.game.id === game.id);
    if (existing) {
      setBetSlip(
        betSlip.map((item) =>
          item.game.id === game.id 
            ? { ...item, betType, odds, spreadValue: value, totalValue: value } 
            : item
        )
      );
    } else {
      setBetSlip([...betSlip, { 
        game, 
        betType, 
        odds, 
        stake: 100,
        spreadValue: value,
        totalValue: value
      }]);
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
    if (betSlip.length === 0) return false;

    const totalStake = betSlip.reduce((sum, item) => sum + item.stake, 0);
    
    const success = deductBalance(
      totalStake,
      `Placed ${betSlip.length} bet(s)`
    );

    if (!success) return false;

    const newBets: Bet[] = betSlip.map((item) => ({
      id: Date.now().toString() + Math.random(),
      gameId: item.game.id,
      game: item.game,
      betType: item.betType,
      odds: item.odds,
      stake: item.stake,
      potentialWin: item.stake * item.odds,
      status: 'pending',
      timestamp: new Date(),
      placedAt: new Date().toISOString(),
    }));

    setBets([...newBets, ...bets]);
    setBetSlip([]);
    return true;
  };

  const clearBetSlip = () => {
    setBetSlip([]);
  };

  const settleBet = (betId: string, won: boolean) => {
    const bet = bets.find((b) => b.id === betId);
    if (!bet || bet.status !== 'pending') return;

    const updatedBets = bets.map((b) =>
      b.id === betId
        ? { ...b, status: won ? 'won' : 'lost', settledAt: new Date().toISOString() }
        : b
    );

    setBets(updatedBets as Bet[]);

    if (won) {
      settleWallet(
        bet.potentialWin,
        true,
        `Won bet on ${bet.game.homeTeam} vs ${bet.game.awayTeam}`
      );
    } else {
      settleWallet(
        0,
        false,
        `Lost bet on ${bet.game.homeTeam} vs ${bet.game.awayTeam}`
      );
    }
  };

  return (
    <BettingContext.Provider
      value={{
        betSlip,
        bets,
        addToBetSlip,
        removeFromBetSlip,
        updateStake,
        placeBets,
        clearBetSlip,
        settleBet,
      }}
    >
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (context === undefined) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
}