import { useEffect, useState } from 'react';
import { fetchAllGames } from '@/lib/sportsApi';
import { Game } from '@/types/betting';
import GameCard from '@/components/GameCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useLiveOdds } from '@/contexts/LiveOddsContext';

export default function Index() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [todayCategory, setTodayCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'home' | 'sport'>('home');
  const [sidebarSelectedSport, setSidebarSelectedSport] = useState<string | null>(null);
  const { setGames: setLiveGames } = useLiveOdds();

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const fetchedGames = await fetchAllGames();
        setGames(fetchedGames);
        setLiveGames(fetchedGames);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
    // Refresh games every 60 seconds to conserve API quota
    const interval = setInterval(loadGames, 60000);
    return () => clearInterval(interval);
  }, [setLiveGames]);

  // Reset todayCategory to 'all' when selectedSport changes
  useEffect(() => {
    setTodayCategory('all');
  }, [selectedSport]);

  const handleSidebarSportClick = (sport: string) => {
    setViewMode('sport');
    setSidebarSelectedSport(sport);
    setSelectedSport(sport);
  };

  const handleHomeClick = () => {
    setViewMode('home');
    setSidebarSelectedSport(null);
    setSelectedSport('all');
    setTodayCategory('all');
  };

  const filteredGames = viewMode === 'sport' && sidebarSelectedSport
    ? games.filter(game => game.sport === sidebarSelectedSport)
    : selectedSport === 'all' 
      ? games 
      : games.filter(game => game.sport === selectedSport);

  // Further filter by today category (only in home mode)
  const todayFilteredGames = viewMode === 'home' && todayCategory !== 'all'
    ? filteredGames.filter(game => game.sport === todayCategory)
    : filteredGames;

  const sportCounts = games.reduce((acc, game) => {
    acc[game.sport] = (acc[game.sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const availableSports = ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer'].filter(
    sport => sportCounts[sport] > 0
  );

  // Get counts for today category filter (based on current sport selection)
  const todayCategoryCounts = filteredGames.reduce((acc, game) => {
    acc[game.sport] = (acc[game.sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const availableTodayCategories = ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer'].filter(
    sport => todayCategoryCounts[sport] > 0
  );

  // Dynamic breadcrumb based on view mode and selected sport
  const getBreadcrumb = () => {
    if (viewMode === 'sport' && sidebarSelectedSport) {
      const sportNames: Record<string, string> = {
        'NFL': 'NFL',
        'NBA': 'NBA',
        'MLB': 'MLB',
        'NHL': 'NHL',
        'Soccer': 'Soccer'
      };
      return (
        <>
          <span>Sportsbook</span>
          <span>/</span>
          <span className="text-white">{sportNames[sidebarSelectedSport] || sidebarSelectedSport}</span>
        </>
      );
    }

    if (selectedSport === 'all') {
      return (
        <>
          <span>Sportsbook</span>
          <span>/</span>
          <span className="text-white">All Sports</span>
        </>
      );
    }
    
    const sportNames: Record<string, string> = {
      'NFL': 'NFL',
      'NBA': 'NBA',
      'MLB': 'MLB',
      'NHL': 'NHL',
      'Soccer': 'Soccer'
    };

    return (
      <>
        <span>Sportsbook</span>
        <span>/</span>
        <span className="text-white">{sportNames[selectedSport] || selectedSport}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0f10]">
      <div className="container mx-auto px-4 py-6">
        {/* Dynamic Breadcrumb */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-[#b1bad3]">
            {getBreadcrumb()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-[#1a1d1f] rounded-lg p-4">
              {/* Home Button */}
              <button
                onClick={handleHomeClick}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors mb-2 ${
                  viewMode === 'home'
                    ? 'bg-[#53d337] text-black'
                    : 'text-[#b1bad3] hover:bg-[#2a2d2f] hover:text-white'
                }`}
              >
                Home
              </button>

              {/* Sports Header */}
              <div className="mt-4 mb-2 px-3">
                <h3 className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
                  Popular
                </h3>
              </div>

              {/* Sports List */}
              <div className="space-y-1">
                {availableSports.map(sport => (
                  <button
                    key={sport}
                    onClick={() => handleSidebarSportClick(sport)}
                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                      sidebarSelectedSport === sport
                        ? 'bg-[#53d337] text-black'
                        : 'text-[#b1bad3] hover:bg-[#2a2d2f] hover:text-white'
                    }`}
                  >
                    <span>{sport}</span>
                    <Badge className="bg-[#2a2d2f] text-[#b1bad3] text-xs">
                      {sportCounts[sport]}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {/* Sport Tabs - Only show in home mode */}
            {viewMode === 'home' && (
              <div className="mb-6 bg-[#0d0f10] border border-[#1a1d1f] rounded-lg p-1">
                <Tabs value={selectedSport} onValueChange={setSelectedSport} className="w-full">
                  <TabsList className="w-full bg-transparent h-auto p-0 gap-1">
                    <TabsTrigger 
                      value="all" 
                      className="flex-1 data-[state=active]:bg-[#1a1d1f] data-[state=active]:text-white text-[#b1bad3] rounded py-2"
                    >
                      All Sports
                      {games.length > 0 && (
                        <Badge className="ml-2 bg-[#53d337] text-black text-xs">
                          {games.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    {availableSports.map(sport => (
                      <TabsTrigger 
                        key={sport}
                        value={sport}
                        className="flex-1 data-[state=active]:bg-[#1a1d1f] data-[state=active]:text-white text-[#b1bad3] rounded py-2"
                      >
                        {sport}
                        <Badge className="ml-2 bg-[#53d337] text-black text-xs">
                          {sportCounts[sport]}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Game Lines Tab - Only this tab visible */}
            <div className="mb-4">
              <button className="px-4 py-2 bg-[#1a1d1f] text-white text-sm font-semibold rounded whitespace-nowrap border-b-2 border-[#53d337]">
                GAME LINES
              </button>
            </div>

            {/* Date Filter - Only show in home mode */}
            {viewMode === 'home' && (
              <div className="mb-4">
                <span className="text-sm text-[#b1bad3] font-semibold">Today</span>
              </div>
            )}

            {/* Category Filter Row - Only show in home mode */}
            {viewMode === 'home' && (
              <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
                <button 
                  onClick={() => setTodayCategory('all')}
                  className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                    todayCategory === 'all' 
                      ? 'bg-[#53d337] text-black' 
                      : 'bg-[#1a1d1f] text-[#b1bad3] hover:bg-[#2a2d2f]'
                  }`}
                >
                  All
                </button>
                {availableTodayCategories.map(sport => (
                  <button 
                    key={sport}
                    onClick={() => setTodayCategory(sport)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                      todayCategory === sport 
                        ? 'bg-[#53d337] text-black' 
                        : 'bg-[#1a1d1f] text-[#b1bad3] hover:bg-[#2a2d2f]'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            )}

            {/* Games List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#53d337]" />
              </div>
            ) : todayFilteredGames.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#b1bad3] text-lg">No games available</p>
                <p className="text-[#5f6368] text-sm mt-2">Check back later for upcoming games</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayFilteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}