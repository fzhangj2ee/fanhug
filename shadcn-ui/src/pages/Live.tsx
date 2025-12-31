import { useState, useEffect } from 'react';
import { fetchAllGames } from '@/lib/sportsApi';
import { Game } from '@/types/betting';
import GameCard from '@/components/GameCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Radio } from 'lucide-react';

export default function Live() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<'all' | 'nfl' | 'nba' | 'mlb' | 'nhl'>('all');

  useEffect(() => {
    loadGames();
    // Refresh live games every 30 seconds
    const interval = setInterval(loadGames, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadGames = async () => {
    try {
      const allGames = await fetchAllGames();
      // Filter to show only live games (status: 'live' or 'in_progress')
      const liveGames = allGames.filter(
        game => game.status === 'live' || game.status === 'in_progress'
      );
      setGames(liveGames);
    } catch (error) {
      console.error('Error loading live games:', error);
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
        <div className="text-white text-xl">Loading live games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="h-8 w-8 text-red-500 animate-pulse" />
            <h1 className="text-4xl font-bold text-white">Live Games</h1>
          </div>
          <p className="text-gray-400">
            {games.length === 0 
              ? 'No live games at the moment. Check back soon!' 
              : `${games.length} live ${games.length === 1 ? 'game' : 'games'} in progress`}
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
                      No live {selectedSport.toUpperCase()} games at the moment
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
            <Radio className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No Live Games</h2>
            <p className="text-gray-500">
              There are no live games at the moment. Check back during game times!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}