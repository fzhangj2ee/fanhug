import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Game } from '@/types/betting';

interface OddsChange {
  gameId: string;
  field: 'homeOdds' | 'awayOdds' | 'drawOdds';
  direction: 'up' | 'down' | 'none';
}

interface LiveOddsContextType {
  games: Game[];
  setGames: (games: Game[]) => void;
  oddsChanges: Map<string, OddsChange>;
  isUpdating: boolean;
}

const LiveOddsContext = createContext<LiveOddsContextType | undefined>(undefined);

export function LiveOddsProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [oddsChanges, setOddsChanges] = useState<Map<string, OddsChange>>(new Map());
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to generate realistic odds fluctuation
  const fluctuateOdds = useCallback((currentOdds: number): number => {
    // Odds typically change by 0.05 to 0.15
    const change = (Math.random() * 0.10 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
    const newOdds = currentOdds + change;
    
    // Keep odds within reasonable bounds (1.20 to 5.00)
    return Math.max(1.20, Math.min(5.00, Number(newOdds.toFixed(2))));
  }, []);

  // Function to update odds for all games
  const updateOdds = useCallback(() => {
    if (games.length === 0) return;

    setIsUpdating(true);
    const newOddsChanges = new Map<string, OddsChange>();

    setGames((prevGames) =>
      prevGames.map((game) => {
        // Only update odds for live games or games starting soon (within 2 hours)
        const gameTime = new Date(game.startTime).getTime();
        const now = Date.now();
        const shouldUpdate = game.isLive || (gameTime - now < 2 * 60 * 60 * 1000 && gameTime > now);

        if (!shouldUpdate) return game;

        // Randomly decide which odds to update (not all at once)
        const updateHome = Math.random() > 0.4;
        const updateAway = Math.random() > 0.4;
        const updateDraw = game.drawOdds && Math.random() > 0.5;

        const newGame = { ...game };

        if (updateHome) {
          const oldOdds = game.homeOdds;
          const newOdds = fluctuateOdds(oldOdds);
          newGame.homeOdds = newOdds;
          
          newOddsChanges.set(`${game.id}-home`, {
            gameId: game.id,
            field: 'homeOdds',
            direction: newOdds > oldOdds ? 'up' : newOdds < oldOdds ? 'down' : 'none',
          });
        }

        if (updateAway) {
          const oldOdds = game.awayOdds;
          const newOdds = fluctuateOdds(oldOdds);
          newGame.awayOdds = newOdds;
          
          newOddsChanges.set(`${game.id}-away`, {
            gameId: game.id,
            field: 'awayOdds',
            direction: newOdds > oldOdds ? 'up' : newOdds < oldOdds ? 'down' : 'none',
          });
        }

        if (updateDraw && game.drawOdds) {
          const oldOdds = game.drawOdds;
          const newOdds = fluctuateOdds(oldOdds);
          newGame.drawOdds = newOdds;
          
          newOddsChanges.set(`${game.id}-draw`, {
            gameId: game.id,
            field: 'drawOdds',
            direction: newOdds > oldOdds ? 'up' : newOdds < oldOdds ? 'down' : 'none',
          });
        }

        // Update scores for live games
        if (game.isLive && Math.random() > 0.7) {
          if (game.homeScore !== undefined && Math.random() > 0.5) {
            newGame.homeScore = game.homeScore + (Math.random() > 0.3 ? 1 : Math.floor(Math.random() * 3) + 3);
          }
          if (game.awayScore !== undefined && Math.random() > 0.5) {
            newGame.awayScore = game.awayScore + (Math.random() > 0.3 ? 1 : Math.floor(Math.random() * 3) + 3);
          }
        }

        return newGame;
      })
    );

    setOddsChanges(newOddsChanges);
    setIsUpdating(false);

    // Clear change indicators after animation
    setTimeout(() => {
      setOddsChanges(new Map());
    }, 2000);
  }, [games, fluctuateOdds]);

  // Set up interval for odds updates
  useEffect(() => {
    if (games.length === 0) return;

    // Update odds every 5-8 seconds (random interval for realism)
    const getRandomInterval = () => Math.floor(Math.random() * 3000) + 5000;
    
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextUpdate = () => {
      timeoutId = setTimeout(() => {
        updateOdds();
        scheduleNextUpdate();
      }, getRandomInterval());
    };

    scheduleNextUpdate();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [games.length, updateOdds]);

  return (
    <LiveOddsContext.Provider
      value={{
        games,
        setGames,
        oddsChanges,
        isUpdating,
      }}
    >
      {children}
    </LiveOddsContext.Provider>
  );
}

export function useLiveOdds() {
  const context = useContext(LiveOddsContext);
  if (context === undefined) {
    throw new Error('useLiveOdds must be used within a LiveOddsProvider');
  }
  return context;
}