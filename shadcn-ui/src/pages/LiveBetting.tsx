import { useQuery } from '@tanstack/react-query';
import { fetchLiveGames } from '@/lib/sportsApi';
import GameCard from '@/components/GameCard';
import BetSlip from '@/components/BetSlip';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

export default function LiveBetting() {
  const { data: games, isLoading } = useQuery({
    queryKey: ['live-games'],
    queryFn: fetchLiveGames,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-8 w-8 text-[#00C853]" />
          <h1 className="text-3xl font-bold text-white">Live Betting</h1>
          <Badge className="bg-[#FF3B30] text-white">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
            {games?.length || 0} Live
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-[200px] bg-[#1C2128]" />
                <Skeleton className="h-[200px] bg-[#1C2128]" />
                <Skeleton className="h-[200px] bg-[#1C2128]" />
                <Skeleton className="h-[200px] bg-[#1C2128]" />
              </div>
            ) : games && games.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No live games at the moment</p>
                <p className="text-[#8B949E] text-sm mt-2">Check back soon for live betting action!</p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <BetSlip />
          </div>
        </div>
      </div>
    </div>
  );
}