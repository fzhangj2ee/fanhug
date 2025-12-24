import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchLiveGames } from '@/lib/sportsApi';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import GameCard from '@/components/GameCard';
import BetSlip from '@/components/BetSlip';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';

export default function LiveBetting() {
  const { data: fetchedGames, isLoading } = useQuery({
    queryKey: ['live-games'],
    queryFn: fetchLiveGames,
    refetchInterval: 15000,
  });

  const { games, setGames } = useLiveOdds();

  useEffect(() => {
    if (fetchedGames) {
      setGames(fetchedGames);
    }
  }, [fetchedGames, setGames]);

  const displayGames = games.length > 0 ? games.filter(g => g.isLive) : fetchedGames || [];

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-8 w-8 text-[#FF3B30]" />
            <h1 className="text-4xl font-bold text-white">Live Betting</h1>
            <Badge className="bg-[#FF3B30] text-white">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              {displayGames.length} Live
            </Badge>
          </div>
          <p className="text-[#8B949E]">Watch odds change in real-time and place your bets</p>
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
            ) : displayGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-[#2A2F36] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Live Games</h3>
                <p className="text-[#8B949E]">Check back soon for live betting opportunities</p>
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