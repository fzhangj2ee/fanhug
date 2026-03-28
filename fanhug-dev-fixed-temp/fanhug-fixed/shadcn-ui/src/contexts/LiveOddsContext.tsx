import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '@/types/betting';
import { fetchAllGames } from '@/lib/sportsApi';

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

// Poll the real Odds API every 30 seconds for live/upcoming games
const POLL_INTERVAL_MS = 30_000;

export function LiveOddsProvider({ children }: { children: React.ReactNode }) {
  const [games, setGamesState] = useState<Game[]>([]);
  const [oddsChanges, setOddsChanges] = useState<Map<string, OddsChange>>(new Map());
  const [isUpdating, setIsUpdating] = useState(false);
  const prevGamesRef = useRef<Map<string, Game>>(new Map());

  const fetchAndUpdate = useCallback(async () => {
    setIsUpdating(true);
    try {
      const freshGames = await fetchAllGames();

      // Compute which odds changed vs previous snapshot
      const newOddsChanges = new Map<string, OddsChange>();
      freshGames.forEach((game) => {
        const prev = prevGamesRef.current.get(game.id);
        if (!prev) return;

        (['homeOdds', 'awayOdds'] as const).forEach((field) => {
          const oldVal = prev[field] as number;
          const newVal = game[field] as number;
          if (oldVal !== newVal) {
            const key = `${game.id}-${field.replace('Odds', '')}`;
            newOddsChanges.set(key, {
              gameId: game.id,
              field,
              direction: newVal > oldVal ? 'up' : 'down',
            });
          }
        });

        if (prev.drawOdds !== undefined && game.drawOdds !== undefined && prev.drawOdds !== game.drawOdds) {
          newOddsChanges.set(`${game.id}-draw`, {
            gameId: game.id,
            field: 'drawOdds',
            direction: game.drawOdds > prev.drawOdds ? 'up' : 'down',
          });
        }
      });

      // Snapshot the new state for next comparison
      const newMap = new Map<string, Game>();
      freshGames.forEach((g) => newMap.set(g.id, g));
      prevGamesRef.current = newMap;

      setGamesState(freshGames);

      if (newOddsChanges.size > 0) {
        setOddsChanges(newOddsChanges);
        // Clear visual indicators after 2 s
        setTimeout(() => setOddsChanges(new Map()), 2000);
      }
    } catch (err) {
      console.error('LiveOddsContext: failed to refresh odds', err);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchAndUpdate();
    const timer = setInterval(fetchAndUpdate, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchAndUpdate]);

  // Allow pages (e.g. Index) to seed the games without triggering an extra fetch
  const setGames = useCallback((incoming: Game[]) => {
    setGamesState(incoming);
    const map = new Map<string, Game>();
    incoming.forEach((g) => map.set(g.id, g));
    prevGamesRef.current = map;
  }, []);

  return (
    <LiveOddsContext.Provider value={{ games, setGames, oddsChanges, isUpdating }}>
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

// Safe hook — returns defaults when called outside the provider
export function useLiveOddsSafe() {
  const context = useContext(LiveOddsContext);
  if (context === undefined) {
    return {
      games: [],
      setGames: () => {},
      oddsChanges: new Map<string, OddsChange>(),
      isUpdating: false,
    };
  }
  return context;
}
