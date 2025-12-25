import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchAllGames } from '@/lib/sportsApi';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const { liveOdds } = useLiveOdds();

  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: fetchAllGames,
    refetchInterval: 60000, // Refetch every minute to get new games
  });

  useEffect(() => {
    document.title = 'Sports Betting Platform - Live Odds';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error loading games</p>
            <p className="text-gray-400 text-sm">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const liveGames = games?.filter((game) => game.isLive) || [];
  const upcomingGames = games?.filter((game) => !game.isLive && game.startTime > now) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Live Games Section */}
        {liveGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-3xl font-bold text-white">Live Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveGames.map((game) => (
                <GameCard key={game.id} game={game} liveOdds={liveOdds[game.id]} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Games Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Upcoming Games</h2>
          {upcomingGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No upcoming games available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingGames.map((game) => (
                <GameCard key={game.id} game={game} liveOdds={liveOdds[game.id]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}