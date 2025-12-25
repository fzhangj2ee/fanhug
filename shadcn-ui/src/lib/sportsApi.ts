import { Game } from '@/types/betting';

const ODDS_API_KEY = 'c8e5155794a017d6eb1e721942e01a31';
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
        point?: number;
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

// Convert decimal odds to American odds
function decimalToAmerican(decimalOdds: number): number {
  if (decimalOdds >= 2.0) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
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
    
    // Get spreads market
    const spreadsMarket = bookmaker.markets.find(m => m.key === 'spreads');
    
    // Get totals market
    const totalsMarket = bookmaker.markets.find(m => m.key === 'totals');

    if (!h2hMarket || h2hMarket.outcomes.length < 2) return null;

    const homeOutcome = h2hMarket.outcomes.find(o => o.name === apiGame.home_team);
    const awayOutcome = h2hMarket.outcomes.find(o => o.name === apiGame.away_team);

    if (!homeOutcome || !awayOutcome) return null;

    // Convert odds to decimal format for compatibility
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

    const game: Game = {
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
      
      // Moneyline (American odds)
      moneyline: {
        home: homeOutcome.price,
        away: awayOutcome.price,
      },
    };

    // Add spread if available
    if (spreadsMarket && spreadsMarket.outcomes.length >= 2) {
      const homeSpread = spreadsMarket.outcomes.find(o => o.name === apiGame.home_team);
      const awaySpread = spreadsMarket.outcomes.find(o => o.name === apiGame.away_team);
      
      if (homeSpread && awaySpread && homeSpread.point !== undefined && awaySpread.point !== undefined) {
        game.spread = {
          home: homeSpread.point,
          homeOdds: homeSpread.price,
          away: awaySpread.point,
          awayOdds: awaySpread.price,
        };
      }
    }

    // Add total if available
    if (totalsMarket && totalsMarket.outcomes.length >= 2) {
      const overOutcome = totalsMarket.outcomes.find(o => o.name === 'Over');
      const underOutcome = totalsMarket.outcomes.find(o => o.name === 'Under');
      
      if (overOutcome && underOutcome && overOutcome.point !== undefined) {
        game.total = {
          over: overOutcome.point,
          overOdds: overOutcome.price,
          under: underOutcome.point || overOutcome.point,
          underOdds: underOutcome.price,
        };
      }
    }

    return game;
  } catch (error) {
    console.error('Error converting game:', error);
    return null;
  }
}

// Fetch games from The Odds API
async function fetchGamesFromAPI(sportKey: string): Promise<Game[]> {
  try {
    const response = await fetch(
      `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&bookmakers=draftkings,fanduel,betmgm`
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