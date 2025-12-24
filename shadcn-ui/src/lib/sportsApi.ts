import { Game } from '@/types/betting';

// Mock sports data for demo - In production, replace with real API calls
const MOCK_GAMES: Game[] = [
  {
    id: '1',
    sport: 'NFL',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    homeOdds: 1.85,
    awayOdds: 2.10,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    isLive: false,
  },
  {
    id: '2',
    sport: 'NBA',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    homeOdds: 1.95,
    awayOdds: 1.95,
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    isLive: false,
  },
  {
    id: '3',
    sport: 'NBA',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Miami Heat',
    homeOdds: 1.75,
    awayOdds: 2.25,
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isLive: true,
    homeScore: 78,
    awayScore: 72,
  },
  {
    id: '4',
    sport: 'Soccer',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    homeOdds: 2.40,
    awayOdds: 2.80,
    drawOdds: 3.20,
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isLive: false,
  },
  {
    id: '5',
    sport: 'MLB',
    homeTeam: 'New York Yankees',
    awayTeam: 'Boston Red Sox',
    homeOdds: 1.90,
    awayOdds: 2.00,
    startTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    isLive: false,
  },
  {
    id: '6',
    sport: 'NFL',
    homeTeam: 'Dallas Cowboys',
    awayTeam: 'Philadelphia Eagles',
    homeOdds: 2.10,
    awayOdds: 1.80,
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isLive: true,
    homeScore: 21,
    awayScore: 17,
  },
  {
    id: '7',
    sport: 'Soccer',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeOdds: 2.20,
    awayOdds: 3.00,
    drawOdds: 3.40,
    startTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    isLive: false,
  },
  {
    id: '8',
    sport: 'NBA',
    homeTeam: 'Brooklyn Nets',
    awayTeam: 'Milwaukee Bucks',
    homeOdds: 2.15,
    awayOdds: 1.75,
    startTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    isLive: false,
  },
];

export async function fetchGames(): Promise<Game[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // In production, replace with actual API call:
  // const response = await fetch('https://api.the-odds-api.com/v4/sports/...');
  // return response.json();
  
  return MOCK_GAMES;
}

export async function fetchLiveGames(): Promise<Game[]> {
  const games = await fetchGames();
  return games.filter((game) => game.isLive);
}

export async function fetchGamesBySport(sport: string): Promise<Game[]> {
  const games = await fetchGames();
  return games.filter((game) => game.sport === sport);
}

export const SPORTS = ['NFL', 'NBA', 'MLB', 'Soccer', 'NHL', 'Tennis'];