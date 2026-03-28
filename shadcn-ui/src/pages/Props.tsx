import { useState, useEffect } from 'react';
import { Game } from "@/types/betting";
import { fetchPlayerProps, PlayerPropsGame, PlayerProp } from '@/lib/sportsApi';
import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import TeamLogo from '@/components/TeamLogo';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SPORTS = ['NBA', 'NFL', 'MLB', 'NHL'] as const;
type Sport = typeof SPORTS[number];

const NBA_MARKETS = ['Points', 'Threes', 'Rebounds', 'Assists', 'Pts + Reb + Ast', 'Double-Double', 'Triple-Double'];
const NFL_MARKETS = ['Pass TDs', 'Pass Yds', 'Rush Yds', 'Receptions', 'Rec Yds', 'Anytime TD'];

function formatOdds(odds: number): string {
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

function formatTime(d: Date): string {
  const date = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const gameDay = new Date(date);
  gameDay.setHours(0, 0, 0, 0);
  const isToday = gameDay.getTime() === today.getTime();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return isToday ? `Today ${time}` : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time}`;
}

// Sliding window: show 3 lines centered on the selected one
function getWindowLines(lines: number[], centerIdx: number): { value: number; idx: number }[] {
  const total = lines.length;
  const window: { value: number; idx: number }[] = [];
  for (let offset = -1; offset <= 1; offset++) {
    const idx = centerIdx + offset;
    if (idx >= 0 && idx < total) window.push({ value: lines[idx], idx });
  }
  return window;
}

interface PropRowProps {
  prop: PlayerProp;
  market: string;
  onBet: (prop: PlayerProp, type: 'over' | 'under', line: number) => void;
}

function PropRow({ prop, market, onBet }: PropRowProps) {
  // Generate a sensible set of lines around the main line
  const isYesNo = prop.statLine === 0;
  const mainLine = prop.statLine;

  // Build 5 possible lines bracketing the main one
  const step = market === 'Points' || market === 'Pts + Reb + Ast' ? 2 : market === 'Pass Yds' || market === 'Rush Yds' || market === 'Rec Yds' ? 10 : 1;
  const lines = isYesNo ? [0] : [mainLine - 2 * step, mainLine - step, mainLine, mainLine + step, mainLine + 2 * step].filter(l => l > 0);
  const [centerIdx, setCenterIdx] = useState(isYesNo ? 0 : lines.indexOf(mainLine));
  const selectedLine = lines[centerIdx];

  const window = getWindowLines(lines, centerIdx);

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-0 border-b border-[#1e2124] hover:bg-[#1a1d1f]/40 transition-colors group">
      {/* Player info */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-[#1e2124] border border-[#2a2d2f] flex items-center justify-center overflow-hidden flex-shrink-0">
          <span className="text-[10px] font-bold text-[#b1bad3]">
            {prop.playerName.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">{prop.playerName}</p>
          {prop.teamName && <p className="text-[#53d337] text-xs">PPG: {prop.teamName}</p>}
        </div>
      </div>

      {/* Scroll left */}
      <button
        onClick={() => setCenterIdx(i => Math.max(0, i - 1))}
        disabled={centerIdx === 0}
        className="px-2 text-[#b1bad3] disabled:opacity-20 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Sliding line windows */}
      {isYesNo ? (
        <div className="flex gap-1">
          <button
            onClick={() => onBet(prop, 'over', 0)}
            className="w-[90px] h-12 flex flex-col items-center justify-center bg-[#0d0f10] hover:bg-[#53d337]/10 border border-[#1e2124] hover:border-[#53d337]/40 rounded transition-all"
          >
            <span className="text-[11px] text-[#b1bad3]">Yes</span>
            <span className="text-sm font-bold text-[#53d337]">{formatOdds(prop.overOdds)}</span>
          </button>
          {prop.underOdds !== prop.overOdds && (
            <button
              onClick={() => onBet(prop, 'under', 0)}
              className="w-[90px] h-12 flex flex-col items-center justify-center bg-[#0d0f10] hover:bg-[#53d337]/10 border border-[#1e2124] hover:border-[#53d337]/40 rounded transition-all"
            >
              <span className="text-[11px] text-[#b1bad3]">No</span>
              <span className="text-sm font-bold text-[#53d337]">{formatOdds(prop.underOdds)}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-1">
          {window.map(({ value, idx }) => {
            const isCenter = idx === centerIdx;
            // Simulate slightly different odds for non-center lines
            const oddsShift = (idx - centerIdx) * 15;
            const displayOver = prop.overOdds - oddsShift;
            const displayUnder = prop.underOdds + oddsShift;
            return (
              <div key={idx} className="flex flex-col gap-1">
                <button
                  onClick={() => onBet({ ...prop, statLine: value, overOdds: displayOver }, 'over', value)}
                  className={cn(
                    'w-[90px] h-[52px] flex flex-col items-center justify-center border rounded transition-all',
                    isCenter
                      ? 'bg-[#1a2a1a] border-[#53d337]/50 shadow-[0_0_8px_rgba(83,211,55,0.15)]'
                      : 'bg-[#0d0f10] border-[#1e2124] hover:bg-[#53d337]/5 hover:border-[#53d337]/30'
                  )}
                >
                  <span className="text-[11px] text-[#b1bad3] font-medium">{value}+</span>
                  <span className={cn('text-sm font-bold', isCenter ? 'text-[#53d337]' : 'text-[#53d337]/80')}>
                    {formatOdds(displayOver)}
                  </span>
                </button>
                <button
                  onClick={() => onBet({ ...prop, statLine: value, underOdds: displayUnder }, 'under', value)}
                  className={cn(
                    'w-[90px] h-[52px] flex flex-col items-center justify-center border rounded transition-all',
                    isCenter
                      ? 'bg-[#1a2a1a] border-[#53d337]/50 shadow-[0_0_8px_rgba(83,211,55,0.15)]'
                      : 'bg-[#0d0f10] border-[#1e2124] hover:bg-[#53d337]/5 hover:border-[#53d337]/30'
                  )}
                >
                  <span className="text-[11px] text-[#b1bad3] font-medium">Under</span>
                  <span className={cn('text-sm font-bold', isCenter ? 'text-[#53d337]' : 'text-[#53d337]/80')}>
                    {formatOdds(displayUnder)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Scroll right */}
      <button
        onClick={() => setCenterIdx(i => Math.min(lines.length - 1, i + 1))}
        disabled={isYesNo || centerIdx === lines.length - 1}
        className="px-2 text-[#b1bad3] disabled:opacity-20 hover:text-white transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Props() {
  const [sport, setSport] = useState<Sport>('NBA');
  const [gamesData, setGamesData] = useState<PlayerPropsGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<PlayerPropsGame | null>(null);
  const [activeMarket, setActiveMarket] = useState('Points');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToBetSlip } = useBetting();
  const { user } = useAuth();
  const navigate = useNavigate();

  const markets = sport === 'NBA' ? NBA_MARKETS : NFL_MARKETS;

  useEffect(() => {
    setGamesData([]);
    setSelectedGame(null);
    setActiveMarket(sport === 'NBA' ? 'Points' : 'Pass TDs');
    loadProps();
  }, [sport]);

  const loadProps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlayerProps(sport);
      setGamesData(data);
      if (data.length > 0) setSelectedGame(data[0]);
    } catch {
      setError('Could not load player props. Please check your Odds API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleBet = (prop: PlayerProp, type: 'over' | 'under', line: number) => {
    if (!user) {
      toast.error('Please login to make picks', {
        action: { label: 'Login', onClick: () => navigate('/login') },
      });
      return;
    }
    // Build a synthetic Game object for the bet slip
    const syntheticGame = {
      id: `prop-${prop.playerId}-${type}-${line}`,
      homeTeam: prop.homeTeam,
      awayTeam: prop.awayTeam,
      homeOdds: 1.9,
      awayOdds: 1.9,
      sport: prop.sport,
      startTime: prop.commenceTime,
      isLive: false,
      status: 'scheduled' as const,
      // Encode prop details into the game name fields so BetSlip can show them
      homeTeam: `${prop.playerName} ${prop.description} ${type === 'over' ? (line > 0 ? `${line}+` : 'Yes') : `Under ${line}`}`,
      awayTeam: `${prop.awayTeam} @ ${prop.homeTeam}`,
    };
    const odds = type === 'over' ? prop.overOdds : prop.underOdds;
    // Convert American to decimal for the betting context
    const decimalOdds = odds >= 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
    addToBetSlip(syntheticGame as Game, 'home', decimalOdds);
    toast.success(`Added: ${prop.playerName} ${prop.description} ${type === 'over' ? (line > 0 ? `${line}+` : 'Yes') : `Under ${line}`}`);
  };

  const currentProps = selectedGame?.marketGroups?.[activeMarket] ?? [];

  return (
    <div className="min-h-screen bg-[#0d0f10] py-6">
      {/* Sport tabs */}
      <div className="border-b border-[#1e2124] mb-0">
        <div className="flex gap-0 px-4">
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={cn(
                'px-5 py-3 text-sm font-semibold tracking-wide transition-colors border-b-2 -mb-px',
                sport === s
                  ? 'text-white border-[#53d337]'
                  : 'text-[#b1bad3] border-transparent hover:text-white'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Market sub-tabs */}
      <div className="border-b border-[#1e2124] mb-4 overflow-x-auto">
        <div className="flex gap-0 px-4 min-w-max">
          {markets.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMarket(m)}
              className={cn(
                'px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap',
                'rounded-full mx-1 my-2 border',
                activeMarket === m
                  ? 'bg-white text-black border-white'
                  : 'text-[#b1bad3] border-[#2a2d2f] hover:border-[#b1bad3] hover:text-white'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="w-6 h-6 text-[#53d337] animate-spin" />
          <span className="text-[#b1bad3]">Loading player props…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white font-semibold">Props Unavailable</p>
          <p className="text-[#b1bad3] text-sm max-w-sm">{error}</p>
        </div>
      ) : gamesData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
          <AlertCircle className="w-10 h-10 text-[#b1bad3]" />
          <p className="text-white font-semibold">No Props Available</p>
          <p className="text-[#b1bad3] text-sm">No upcoming {sport} games with player props right now.</p>
        </div>
      ) : (
        <>
          {/* Game selector */}
          {gamesData.map((game) => (
            <div
              key={game.gameId}
              onClick={() => setSelectedGame(game)}
              className={cn(
                'px-4 py-3 cursor-pointer border-b border-[#1e2124] transition-colors',
                selectedGame?.gameId === game.gameId ? 'bg-[#1a1d1f]' : 'hover:bg-[#1a1d1f]/50'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TeamLogo teamName={game.awayTeam} sport={game.sport} size="sm" />
                  <span className="text-[#b1bad3] text-sm font-medium">{game.awayTeam}</span>
                  <span className="text-[#5f6368] text-xs px-1">AT</span>
                  <span className="text-[#b1bad3] text-sm font-medium">{game.homeTeam}</span>
                  <TeamLogo teamName={game.homeTeam} sport={game.sport} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#1e2124] text-[#53d337] text-[10px] border border-[#2a2d2f]">SGP</Badge>
                  <span className="text-[#8B949E] text-xs">{formatTime(game.commenceTime)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Props table */}
          {selectedGame && (
            <div className="mt-2">
              {/* Column header */}
              <div className="px-4 py-2 bg-[#0d0f10] border-b border-[#1e2124]">
                <div className="flex items-center gap-3">
                  <TeamLogo teamName={selectedGame.awayTeam} sport={selectedGame.sport} size="md" />
                  <span className="text-white font-semibold">{selectedGame.awayTeam}</span>
                  <span className="text-[#5f6368] text-sm">AT</span>
                  <span className="text-white font-semibold">{selectedGame.homeTeam}</span>
                  <TeamLogo teamName={selectedGame.homeTeam} sport={selectedGame.sport} size="md" />
                  <span className="text-[#b1bad3] text-xs ml-2">{formatTime(selectedGame.commenceTime)}</span>
                </div>
                <p className="text-[#b1bad3] text-sm mt-1">{activeMarket}</p>
              </div>

              {currentProps.length === 0 ? (
                <div className="py-12 text-center text-[#b1bad3]">
                  No {activeMarket} props for this game.
                </div>
              ) : (
                currentProps.map((prop) => (
                  <PropRow
                    key={prop.playerId}
                    prop={prop}
                    market={activeMarket}
                    onBet={handleBet}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
