export interface Game {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  startTime: string;
  isLive: boolean;
  homeScore?: number;
  awayScore?: number;
}

export interface Bet {
  id: string;
  gameId: string;
  game: Game;
  betType: 'home' | 'away' | 'draw';
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost';
  placedAt: string;
  settledAt?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet_placed' | 'bet_won' | 'bet_lost';
  amount: number;
  description: string;
  timestamp: string;
  balance: number;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
}