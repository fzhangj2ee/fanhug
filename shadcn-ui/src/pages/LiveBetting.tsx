import { useQuery } from '@tanstack/react-query';
import { fetchLiveGames } from '@/lib/sportsApi';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import GameCard from '@/components/GameCard';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

export default function LiveBetting() {
  const { liveOdds } = useLiveOdds();

  const { data: games, isLoading, error } = useQuery({
    queryKey: ['liveGames'],
    queryFn: fetchLiveGames,
    refetchInterval: 30000, // Refetch every 30 seconds for live games
  });

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
            <p className="text-red-400 mb-4">Error loading live games</p>
            <p className="text-gray-400 text-sm">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-4xl font-bold text-white">Live Betting</h1>
        </div>

        {!games || games.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No live games at the moment</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for live betting action!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} liveOdds={liveOdds[game.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}