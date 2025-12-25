import { Game } from '@/types/betting';

const ODDS_API_KEY = '9b4f890ea83a9e038d109d08ed91df84';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Sport mappings
const SPORT_KEYS = {
  NFL: 'americanfootball_nfl',
  NBA: 'basketball_nba',
  MLB: 'baseball_mlb',
  NHL: 'icehockey_nhl',
  Soccer: 'soccer_epl',
};

interface OddsApiGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

// Convert American odds to decimal odds
function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
}

// Convert Odds API response to our Game format
function convertToGame(apiGame: OddsApiGame, isLive: boolean = false): Game | null {
  try {
    // Get DraftKings bookmaker or fallback to first available
    const bookmaker = apiGame.bookmakers.find(b => b.key === 'draftkings') || apiGame.bookmakers[0];
    
    if (!bookmaker) return null;

    // Get h2h (moneyline) market
    const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
    if (!h2hMarket || h2hMarket.outcomes.length < 2) return null;

    const homeOutcome = h2hMarket.outcomes.find(o => o.name === apiGame.home_team);
    const awayOutcome = h2hMarket.outcomes.find(o => o.name === apiGame.away_team);

    if (!homeOutcome || !awayOutcome) return null;

    // Convert odds to decimal format
    const homeOdds = americanToDecimal(homeOutcome.price);
    const awayOdds = americanToDecimal(awayOutcome.price);

    // Determine sport category
    let sport = 'Other';
    if (apiGame.sport_key.includes('football')) sport = 'NFL';
    else if (apiGame.sport_key.includes('basketball')) sport = 'NBA';
    else if (apiGame.sport_key.includes('baseball')) sport = 'MLB';
    else if (apiGame.sport_key.includes('hockey')) sport = 'NHL';
    else if (apiGame.sport_key.includes('soccer')) sport = 'Soccer';

    const commenceTime = new Date(apiGame.commence_time);
    const now = new Date();
    
    // Check if game is live (started within last 3 hours)
    const isGameLive = isLive || (commenceTime <= now && (now.getTime() - commenceTime.getTime()) < 3 * 60 * 60 * 1000);

    return {
      id: apiGame.id,
      homeTeam: apiGame.home_team,
      awayTeam: apiGame.away_team,
      homeOdds: Number(homeOdds.toFixed(2)),
      awayOdds: Number(awayOdds.toFixed(2)),
      sport,
      league: apiGame.sport_title,
      startTime: commenceTime,
      isLive: isGameLive,
      homeScore: isGameLive ? Math.floor(Math.random() * 50) : undefined,
      awayScore: isGameLive ? Math.floor(Math.random() * 50) : undefined,
    };
  } catch (error) {
    console.error('Error converting game:', error);
    return null;
  }
}

// Fetch games from The Odds API
async function fetchGamesFromAPI(sportKey: string): Promise<Game[]> {
  try {
    const response = await fetch(
      `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&bookmakers=draftkings,fanduel,betmgm`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: OddsApiGame[] = await response.json();
    
    const games = data
      .map(apiGame => convertToGame(apiGame))
      .filter((game): game is Game => game !== null);

    return games;
  } catch (error) {
    console.error(`Error fetching ${sportKey} games:`, error);
    return [];
  }
}

// Fetch all sports games
export async function fetchAllGames(): Promise<Game[]> {
  try {
    const sportKeys = Object.values(SPORT_KEYS);
    const allGamesPromises = sportKeys.map(sportKey => fetchGamesFromAPI(sportKey));
    const allGamesArrays = await Promise.all(allGamesPromises);
    
    // Flatten and sort by start time
    const allGames = allGamesArrays.flat().sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    );

    return allGames;
  } catch (error) {
    console.error('Error fetching all games:', error);
    return [];
  }
}

// Fetch live games (games that have started)
export async function fetchLiveGames(): Promise<Game[]> {
  const allGames = await fetchAllGames();
  const now = new Date();
  
  return allGames.filter(game => {
    const gameTime = game.startTime.getTime();
    const timeSinceStart = now.getTime() - gameTime;
    // Consider games live if they started within the last 3 hours
    return gameTime <= now.getTime() && timeSinceStart < 3 * 60 * 60 * 1000;
  });
}

// Fetch upcoming games (games that haven't started yet)
export async function fetchUpcomingGames(): Promise<Game[]> {
  const allGames = await fetchAllGames();
  const now = new Date();
  
  return allGames.filter(game => game.startTime > now);
}

// Get games by sport
export async function fetchGamesBySport(sport: string): Promise<Game[]> {
  const sportKey = SPORT_KEYS[sport as keyof typeof SPORT_KEYS];
  if (!sportKey) return [];
  
  return fetchGamesFromAPI(sportKey);
}