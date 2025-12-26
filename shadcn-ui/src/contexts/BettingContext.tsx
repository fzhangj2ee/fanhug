import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bet, Game } from '@/types/betting';
import { useWallet } from './WalletContext';
import { fetchAllCompletedGames } from '@/lib/sportsApi';

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
  checkAndGradeBets: () => Promise<void>;
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

  // Auto-grade bets every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndGradeBets();
    }, 60000); // Check every minute

    // Initial check
    checkAndGradeBets();

    return () => clearInterval(interval);
  }, [bets]);

  const checkAndGradeBets = async () => {
    const pendingBets = bets.filter(b => b.status === 'pending');
    if (pendingBets.length === 0) return;

    try {
      const completedGames = await fetchAllCompletedGames();
      const updatedBets = [...bets];
      let hasChanges = false;

      pendingBets.forEach(bet => {
        const completedGame = completedGames.get(bet.gameId);
        
        if (completedGame && completedGame.status === 'final' && 
            completedGame.homeScore !== undefined && completedGame.awayScore !== undefined) {
          
          const won = evaluateBet(bet, completedGame);
          const betIndex = updatedBets.findIndex(b => b.id === bet.id);
          
          if (betIndex !== -1) {
            // Update bet with game results
            updatedBets[betIndex] = {
              ...updatedBets[betIndex],
              status: won ? 'won' : 'lost',
              settledAt: completedGame.completedAt || new Date().toISOString(),
              payout: won ? bet.potentialWin : 0,
              game: {
                ...updatedBets[betIndex].game,
                homeScore: completedGame.homeScore,
                awayScore: completedGame.awayScore,
                status: 'final',
                completedAt: completedGame.completedAt,
                periodScores: completedGame.periodScores,
              }
            };

            // Update wallet
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

            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setBets(updatedBets);
      }
    } catch (error) {
      console.error('Error grading bets:', error);
    }
  };

  const evaluateBet = (bet: Bet, completedGame: Game): boolean => {
    const homeScore = completedGame.homeScore!;
    const awayScore = completedGame.awayScore!;
    const totalScore = homeScore + awayScore;

    switch (bet.betType) {
      case 'home':
        return homeScore > awayScore;
      
      case 'away':
        return awayScore > homeScore;
      
      case 'spread-home':
        if (bet.line !== undefined) {
          return (homeScore + bet.line) > awayScore;
        }
        return false;
      
      case 'spread-away':
        if (bet.line !== undefined) {
          return (awayScore + bet.line) > homeScore;
        }
        return false;
      
      case 'over':
        if (bet.line !== undefined) {
          return totalScore > bet.line;
        }
        return false;
      
      case 'under':
        if (bet.line !== undefined) {
          return totalScore < bet.line;
        }
        return false;
      
      default:
        return false;
    }
  };

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

    const newBets: Bet[] = betSlip.map((item) => {
      // Determine market type and line
      let marketType: 'moneyline' | 'spread' | 'total' = 'moneyline';
      let line: number | undefined;

      if (item.betType.includes('spread')) {
        marketType = 'spread';
        line = item.spreadValue;
      } else if (item.betType === 'over' || item.betType === 'under') {
        marketType = 'total';
        line = item.totalValue;
      }

      return {
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
        marketType,
        line,
      };
    });

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
        ? { ...b, status: won ? 'won' : 'lost', settledAt: new Date().toISOString(), payout: won ? b.potentialWin : 0 }
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
        checkAndGradeBets,
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