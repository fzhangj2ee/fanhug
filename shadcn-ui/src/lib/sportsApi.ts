import { Game } from '@/types/betting';

const ODDS_API_KEY = import.meta.env.VITE_ODDS_API_KEY || '6bf99bc59e61d7a778ce747d58b06376';
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

interface OddsApiScore {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores: Array<{
    name: string;
    score: string;
  }> | null;
  last_update: string | null;
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

    // Keep odds in decimal format as returned by API
    const homeOdds = homeOutcome.price;
    const awayOdds = awayOutcome.price;

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
      status: isGameLive ? 'in_progress' : 'scheduled',
      // Don't show scores unless we have actual data from the scores API
      homeScore: undefined,
      awayScore: undefined,
      
      // Moneyline (decimal odds format)
      moneyline: {
        home: Number(homeOutcome.price.toFixed(2)),
        away: Number(awayOutcome.price.toFixed(2)),
      },
    };

    // Add spread if available
    if (spreadsMarket && spreadsMarket.outcomes.length >= 2) {
      const homeSpread = spreadsMarket.outcomes.find(o => o.name === apiGame.home_team);
      const awaySpread = spreadsMarket.outcomes.find(o => o.name === apiGame.away_team);
      
      if (homeSpread && awaySpread && homeSpread.point !== undefined && awaySpread.point !== undefined) {
        game.spread = {
          home: homeSpread.point,
          homeOdds: Number(homeSpread.price.toFixed(2)),
          away: awaySpread.point,
          awayOdds: Number(awaySpread.price.toFixed(2)),
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
          overOdds: Number(overOutcome.price.toFixed(2)),
          under: underOutcome.point || overOutcome.point,
          underOdds: Number(underOutcome.price.toFixed(2)),
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

// Fetch live scores from The Odds API (for in-progress games)
export async function fetchLiveScores(sportKey: string): Promise<Map<string, { homeScore: number; awayScore: number }>> {
  try {
    const response = await fetch(
      `${ODDS_API_BASE}/sports/${sportKey}/scores/?apiKey=${ODDS_API_KEY}&daysFrom=1`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: OddsApiScore[] = await response.json();
    const scoresMap = new Map<string, { homeScore: number; awayScore: number }>();

    data.forEach(scoreData => {
      // Only process games that are NOT completed (live games)
      if (!scoreData.completed && scoreData.scores && scoreData.scores.length > 0) {
        const homeScore = scoreData.scores.find(s => s.name === scoreData.home_team);
        const awayScore = scoreData.scores.find(s => s.name === scoreData.away_team);

        if (homeScore && awayScore) {
          scoresMap.set(scoreData.id, {
            homeScore: parseInt(homeScore.score),
            awayScore: parseInt(awayScore.score),
          });
        }
      }
    });

    return scoresMap;
  } catch (error) {
    console.error(`Error fetching live scores for ${sportKey}:`, error);
    return new Map();
  }
}

// Fetch all live scores across all sports
export async function fetchAllLiveScores(): Promise<Map<string, { homeScore: number; awayScore: number }>> {
  try {
    const sportKeys = Object.values(SPORT_KEYS);
    const allScoresPromises = sportKeys.map(sportKey => fetchLiveScores(sportKey));
    const allScoresArrays = await Promise.all(allScoresPromises);
    
    // Merge all maps
    const mergedMap = new Map<string, { homeScore: number; awayScore: number }>();
    allScoresArrays.forEach(scoresMap => {
      scoresMap.forEach((score, id) => {
        mergedMap.set(id, score);
      });
    });
    
    return mergedMap;
  } catch (error) {
    console.error('Error fetching all live scores:', error);
    return new Map();
  }
}

// Fetch game scores from The Odds API
export async function fetchGameScores(sportKey: string): Promise<Map<string, Game>> {
  try {
    const response = await fetch(
      `${ODDS_API_BASE}/sports/${sportKey}/scores/?apiKey=${ODDS_API_KEY}&daysFrom=7`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: OddsApiScore[] = await response.json();
    const scoresMap = new Map<string, Game>();

    data.forEach(scoreData => {
      if (scoreData.completed && scoreData.scores) {
        const homeScore = scoreData.scores.find(s => s.name === scoreData.home_team);
        const awayScore = scoreData.scores.find(s => s.name === scoreData.away_team);

        if (homeScore && awayScore) {
          // Determine sport category
          let sport = 'Other';
          if (scoreData.sport_key.includes('football')) sport = 'NFL';
          else if (scoreData.sport_key.includes('basketball')) sport = 'NBA';
          else if (scoreData.sport_key.includes('baseball')) sport = 'MLB';
          else if (scoreData.sport_key.includes('hockey')) sport = 'NHL';
          else if (scoreData.sport_key.includes('soccer')) sport = 'Soccer';

          const finalHomeScore = parseInt(homeScore.score);
          const finalAwayScore = parseInt(awayScore.score);

          // Generate simulated period scores based on final score
          const periodScores = generatePeriodScores(sport, finalHomeScore, finalAwayScore);

          const game: Game = {
            id: scoreData.id,
            homeTeam: scoreData.home_team,
            awayTeam: scoreData.away_team,
            homeOdds: 1.0,
            awayOdds: 1.0,
            sport,
            league: scoreData.sport_title,
            startTime: new Date(scoreData.commence_time),
            isLive: false,
            status: 'final',
            homeScore: finalHomeScore,
            awayScore: finalAwayScore,
            completedAt: scoreData.last_update || new Date().toISOString(),
            periodScores,
          };

          scoresMap.set(scoreData.id, game);
        }
      }
    });

    return scoresMap;
  } catch (error) {
    console.error(`Error fetching ${sportKey} scores:`, error);
    return new Map();
  }
}

// Generate simulated period scores that add up to final score
function generatePeriodScores(sport: string, finalHome: number, finalAway: number) {
  const periods = sport === 'NBA' ? 4 : sport === 'NFL' ? 4 : sport === 'NHL' ? 3 : sport === 'MLB' ? 9 : 2;
  
  const homeScores: number[] = [];
  const awayScores: number[] = [];
  
  let remainingHome = finalHome;
  let remainingAway = finalAway;
  
  for (let i = 0; i < periods - 1; i++) {
    const homeScore = Math.floor(Math.random() * (remainingHome / (periods - i))) + Math.floor(remainingHome / (periods * 2));
    const awayScore = Math.floor(Math.random() * (remainingAway / (periods - i))) + Math.floor(remainingAway / (periods * 2));
    
    homeScores.push(Math.max(0, Math.min(homeScore, remainingHome)));
    awayScores.push(Math.max(0, Math.min(awayScore, remainingAway)));
    
    remainingHome -= homeScores[i];
    remainingAway -= awayScores[i];
  }
  
  // Last period gets remaining points
  homeScores.push(Math.max(0, remainingHome));
  awayScores.push(Math.max(0, remainingAway));
  
  return { home: homeScores, away: awayScores };
}

// Fetch all completed game scores
export async function fetchAllCompletedGames(): Promise<Map<string, Game>> {
  try {
    const sportKeys = Object.values(SPORT_KEYS);
    const allScoresPromises = sportKeys.map(sportKey => fetchGameScores(sportKey));
    const allScoresArrays = await Promise.all(allScoresPromises);
    
    // Merge all maps
    const mergedMap = new Map<string, Game>();
    allScoresArrays.forEach(scoresMap => {
      scoresMap.forEach((game, id) => {
        mergedMap.set(id, game);
      });
    });
    
    return mergedMap;
  } catch (error) {
    console.error('Error fetching all completed games:', error);
    return new Map();
  }
}

// Fetch all sports games with live scores
export async function fetchAllGames(): Promise<Game[]> {
  try {
    const sportKeys = Object.values(SPORT_KEYS);
    const allGamesPromises = sportKeys.map(sportKey => fetchGamesFromAPI(sportKey));
    const allGamesArrays = await Promise.all(allGamesPromises);
    
    // Flatten games
    let allGames = allGamesArrays.flat();
    
    // Fetch live scores for all sports
    const liveScores = await fetchAllLiveScores();
    
    // Merge live scores into games
    allGames = allGames.map(game => {
      const score = liveScores.get(game.id);
      if (score && game.isLive) {
        return {
          ...game,
          homeScore: score.homeScore,
          awayScore: score.awayScore,
        };
      }
      return game;
    });
    
    // Sort by start time
    allGames.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

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
// ─── Player Props ────────────────────────────────────────────────────────────

export interface PlayerProp {
  playerId: string;       // synthetic key: player name slug
  playerName: string;
  teamName: string;
  description: string;   // e.g. "Points"
  statLine: number;      // the line value (e.g. 27.5)
  overOdds: number;      // American odds
  underOdds: number;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  sport: string;
}

export interface PlayerPropsGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  sport: string;
  marketGroups: {
    [market: string]: PlayerProp[];   // keyed by friendly label
  };
}

const PLAYER_PROP_MARKET_LABELS: Record<string, string> = {
  player_points:           'Points',
  player_threes:           'Threes',
  player_rebounds:         'Rebounds',
  player_assists:          'Assists',
  player_points_rebounds_assists: 'Pts + Reb + Ast',
  player_double_double:    'Double-Double',
  player_triple_double:    'Triple-Double',
  player_pass_tds:         'Pass TDs',
  player_pass_yds:         'Pass Yds',
  player_rush_yds:         'Rush Yds',
  player_receptions:       'Receptions',
  player_reception_yds:    'Rec Yds',
  player_anytime_td:       'Anytime TD',
};

const PROP_SPORT_KEYS: Record<string, string> = {
  NBA: 'basketball_nba',
  NFL: 'americanfootball_nfl',
  MLB: 'baseball_mlb',
  NHL: 'icehockey_nhl',
};

export async function fetchPlayerProps(sport: string = 'NBA'): Promise<PlayerPropsGame[]> {
  const sportKey = PROP_SPORT_KEYS[sport] || PROP_SPORT_KEYS.NBA;
  const markets = sport === 'NBA'
    ? 'player_points,player_threes,player_rebounds,player_assists,player_points_rebounds_assists'
    : 'player_pass_tds,player_pass_yds,player_rush_yds,player_receptions,player_anytime_td';

  try {
    const response = await fetch(
      `${ODDS_API_BASE}/sports/${sportKey}/events?apiKey=${ODDS_API_KEY}`
    );
    if (!response.ok) throw new Error(`Events API error: ${response.status}`);
    const events: Array<{ id: string; home_team: string; away_team: string; commence_time: string }> = await response.json();

    // Take first 3 upcoming games to keep API calls reasonable
    const upcoming = events
      .filter(e => new Date(e.commence_time) > new Date())
      .slice(0, 3);

    const results: PlayerPropsGame[] = [];

    for (const event of upcoming) {
      try {
        const propsRes = await fetch(
          `${ODDS_API_BASE}/sports/${sportKey}/events/${event.id}/odds?apiKey=${ODDS_API_KEY}&regions=us&markets=${markets}&bookmakers=draftkings`
        );
        if (!propsRes.ok) continue;
        const propsData = await propsRes.json();

        const bookmaker = propsData.bookmakers?.[0];
        if (!bookmaker) continue;

        const marketGroups: PlayerPropsGame['marketGroups'] = {};

        for (const market of bookmaker.markets) {
          const label = PLAYER_PROP_MARKET_LABELS[market.key];
          if (!label) continue;

          // Group outcomes by player
          const byPlayer: Record<string, { over?: number; under?: number; line?: number; description?: string }> = {};

          for (const outcome of market.outcomes) {
            const player = outcome.description || outcome.name;
            if (!byPlayer[player]) byPlayer[player] = {};
            if (outcome.name === 'Over') {
              byPlayer[player].over = outcome.price;
              byPlayer[player].line = outcome.point;
              byPlayer[player].description = outcome.description;
            } else if (outcome.name === 'Under') {
              byPlayer[player].under = outcome.price;
              if (!byPlayer[player].line) byPlayer[player].line = outcome.point;
            } else {
              // Yes/No style (double-double, triple-double, anytime TD)
              byPlayer[player].over = outcome.price;
              byPlayer[player].line = undefined;
            }
          }

          const props: PlayerProp[] = Object.entries(byPlayer).map(([playerName, data]) => ({
            playerId: `${playerName.toLowerCase().replace(/\s+/g, '-')}-${event.id}`,
            playerName,
            teamName: '',
            description: label,
            statLine: data.line ?? 0,
            overOdds: data.over ?? -110,
            underOdds: data.under ?? -110,
            gameId: event.id,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            commenceTime: new Date(event.commence_time),
            sport,
          }));

          if (props.length > 0) marketGroups[label] = props;
        }

        if (Object.keys(marketGroups).length > 0) {
          results.push({
            gameId: event.id,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            commenceTime: new Date(event.commence_time),
            sport,
            marketGroups,
          });
        }
      } catch (err) {
        console.error(`Error fetching props for event ${event.id}:`, err);
      }
    }

    return results;
  } catch (err) {
    console.error('fetchPlayerProps error:', err);
    return [];
  }
}

// ─── Futures ─────────────────────────────────────────────────────────────────

export interface FuturesOutcome {
  name: string;   // team or player name
  odds: number;   // American odds
}

export interface FuturesMarket {
  key: string;
  label: string;
  description: string;
  outcomes: FuturesOutcome[];
  sport: string;
  lastUpdate: string;
}

const FUTURES_MARKET_LABELS: Record<string, string> = {
  championship_winner:    'Champion',
  division_winner:        'Division Winner',
  conference_winner:      'Conference Winner',
  wins:                   'Season Wins',
  season_player_props:    'Player Awards',
  outright_winner:        'Winner',
};

const FUTURES_SPORT_KEYS: Record<string, { key: string; markets: string }> = {
  NBA: { key: 'basketball_nba', markets: 'championship_winner,conference_winner,division_winner' },
  NFL: { key: 'americanfootball_nfl', markets: 'championship_winner,conference_winner,division_winner' },
  MLB: { key: 'baseball_mlb', markets: 'championship_winner,division_winner' },
  NHL: { key: 'icehockey_nhl', markets: 'championship_winner,conference_winner,division_winner' },
};

export async function fetchFutures(sport: string = 'NBA'): Promise<FuturesMarket[]> {
  const config = FUTURES_SPORT_KEYS[sport] || FUTURES_SPORT_KEYS.NBA;

  try {
    const response = await fetch(
      `${ODDS_API_BASE}/sports/${config.key}/odds?apiKey=${ODDS_API_KEY}&regions=us&markets=${config.markets}&bookmakers=draftkings&oddsFormat=american`
    );
    if (!response.ok) throw new Error(`Futures API error: ${response.status}`);

    const data = await response.json();

    // The futures endpoint returns a single event (or array) with markets
    const events = Array.isArray(data) ? data : [data];

    const marketsMap: Record<string, FuturesMarket> = {};

    for (const event of events) {
      const bookmaker = event.bookmakers?.find((b: Record<string, unknown>) => b.key === 'draftkings') || event.bookmakers?.[0];
      if (!bookmaker) continue;

      for (const market of bookmaker.markets) {
        const label = FUTURES_MARKET_LABELS[market.key] || market.key;
        const key = market.key;

        const outcomes: FuturesOutcome[] = market.outcomes
          .map((o: Record<string, unknown>) => ({ name: o.name as string, odds: o.price as number }))
          .sort((a: FuturesOutcome, b: FuturesOutcome) => a.odds - b.odds);

        if (!marketsMap[key]) {
          marketsMap[key] = {
            key,
            label,
            description: `${sport} ${label}`,
            outcomes,
            sport,
            lastUpdate: bookmaker.last_update || new Date().toISOString(),
          };
        } else {
          // Merge outcomes from multiple events (e.g. multiple division winners)
          marketsMap[key].outcomes.push(...outcomes);
          marketsMap[key].outcomes.sort((a, b) => a.odds - b.odds);
        }
      }
    }

    return Object.values(marketsMap);
  } catch (err) {
    console.error('fetchFutures error:', err);
    return [];
  }
}
