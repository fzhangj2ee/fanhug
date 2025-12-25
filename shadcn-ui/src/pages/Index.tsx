import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchAllGames } from '@/lib/sportsApi';
import { useLiveOdds } from '@/contexts/LiveOddsContext';
import GameCard from '@/components/GameCard';
import BetSlip from '@/components/BetSlip';
import WalletBalance from '@/components/WalletBalance';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Index() {
  const { data: fetchedGames, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: fetchAllGames,
    refetchInterval: 30000,
  });

  const { games, setGames, liveOdds } = useLiveOdds();

  useEffect(() => {
    if (fetchedGames) {
      setGames(fetchedGames);
    }
  }, [fetchedGames, setGames]);

  const displayGames = games.length > 0 ? games : fetchedGames || [];
  const liveGames = displayGames.filter((game) => game.isLive);
  const upcomingGames = displayGames.filter((game) => !game.isLive);

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="/assets/hero-sports-stadium.jpg"
          alt="Sports Stadium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1419] via-[#0F1419]/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-white">Welcome to BetPro</h1>
            <p className="text-xl text-[#8B949E]">Place your bets on live sports with real-time odds</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <WalletBalance />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {/* Live Games */}
            {liveGames.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-white">Live Now</h2>
                  <Badge className="bg-[#FF3B30] text-white">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                    {liveGames.length} Live
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-[200px] bg-[#1C2128]" />
                      <Skeleton className="h-[200px] bg-[#1C2128]" />
                    </>
                  ) : (
                    liveGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        liveOdds={liveOdds?.[game.id]}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Games */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Upcoming Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-[200px] bg-[#1C2128]" />
                    <Skeleton className="h-[200px] bg-[#1C2128]" />
                    <Skeleton className="h-[200px] bg-[#1C2128]" />
                    <Skeleton className="h-[200px] bg-[#1C2128]" />
                  </>
                ) : (
                  upcomingGames.map((game) => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      liveOdds={liveOdds?.[game.id]}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <BetSlip />
          </div>
        </div>
      </div>
    </div>
  );
}