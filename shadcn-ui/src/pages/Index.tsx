import { useState, useEffect } from 'react';
import { fetchAllGames } from '@/lib/sportsApi';
import { useLiveOddsSafe } from '@/contexts/LiveOddsContext';
import { Game } from '@/types/betting';
import GameCard from '@/components/GameCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';

export default function Index() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<'all' | 'nfl' | 'nba' | 'mlb' | 'nhl'>('all');
  const { setGames: setLiveGames } = useLiveOddsSafe();

  useEffect(() => {
    loadGames();
    // Refresh games every 60 seconds
    const interval = setInterval(loadGames, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadGames = async () => {
    try {
      const allGames = await fetchAllGames();
      
      // Sort games: live games first, then by start time
      const sortedGames = allGames.sort((a, b) => {
        // Live games come first
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        
        // Then sort by start time
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
      
      setGames(sortedGames);
      setLiveGames(sortedGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = selectedSport === 'all' 
    ? games 
    : games.filter(game => game.sport.toLowerCase() === selectedSport);

  const sportCounts = {
    all: games.length,
    nfl: games.filter(g => g.sport.toLowerCase() === 'nfl').length,
    nba: games.filter(g => g.sport.toLowerCase() === 'nba').length,
    mlb: games.filter(g => g.sport.toLowerCase() === 'mlb').length,
    nhl: games.filter(g => g.sport.toLowerCase() === 'nhl').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-green-500" />
            <h1 className="text-4xl font-bold text-white">Sports Betting</h1>
          </div>
          <p className="text-gray-400">
            {games.length === 0 
              ? 'No games available at the moment.' 
              : `${games.length} ${games.length === 1 ? 'game' : 'games'} available for betting`}
          </p>
        </div>

        {games.length > 0 && (
          <>
            <Tabs value={selectedSport} onValueChange={(value) => setSelectedSport(value as typeof selectedSport)} className="mb-8">
              <TabsList className="bg-gray-800 border border-gray-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  All ({sportCounts.all})
                </TabsTrigger>
                <TabsTrigger value="nfl" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  NFL ({sportCounts.nfl})
                </TabsTrigger>
                <TabsTrigger value="nba" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  NBA ({sportCounts.nba})
                </TabsTrigger>
                <TabsTrigger value="mlb" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  MLB ({sportCounts.mlb})
                </TabsTrigger>
                <TabsTrigger value="nhl" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                  NHL ({sportCounts.nhl})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedSport} className="mt-6">
                {filteredGames.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                      No {selectedSport.toUpperCase()} games available at the moment
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {games.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No Games Available</h2>
            <p className="text-gray-500">
              Check back later for upcoming games!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}