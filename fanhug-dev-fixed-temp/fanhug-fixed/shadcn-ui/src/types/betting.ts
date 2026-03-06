export interface Game {
  id: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  startTime: Date;
  isLive: boolean;
  homeScore?: number;
  awayScore?: number;
  
  // American betting markets
  moneyline?: {
    home: number; // American odds (e.g., -150, +200)
    away: number;
  };
  spread?: {
    home: number; // Point spread (e.g., -7.5)
    homeOdds: number; // American odds for home spread
    away: number; // Point spread (e.g., +7.5)
    awayOdds: number; // American odds for away spread
  };
  total?: {
    over: number; // Total points (e.g., 45.5)
    overOdds: number; // American odds for over
    under: number; // Total points (e.g., 45.5)
    underOdds: number; // American odds for under
  };
  
  // Game status and results
  status?: 'scheduled' | 'in_progress' | 'final' | 'postponed' | 'cancelled';
  completedAt?: string; // ISO timestamp when game finished
  periodScores?: {
    home: number[];
    away: number[];
  };
}

export interface Bet {
  id: string;
  gameId: string;
  game: Game;
  betType: 'home' | 'away' | 'draw' | 'spread-home' | 'spread-away' | 'over' | 'under';
  odds: number;
  stake: number;
  potentialWin: number;
  timestamp: Date;
  status: 'pending' | 'won' | 'lost';
  marketType?: 'moneyline' | 'spread' | 'total';
  line?: number; // For spread/total bets
  placedAt?: string; // ISO timestamp
  settledAt?: string; // ISO timestamp
  payout?: number; // Actual payout for won bets
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  amount: number;
  timestamp: Date;
  description: string;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
}