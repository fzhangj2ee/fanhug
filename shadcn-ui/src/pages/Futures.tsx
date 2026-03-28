import { useState, useEffect } from 'react';
import { Game } from "@/types/betting";
import { fetchFutures, FuturesMarket, FuturesOutcome } from '@/lib/sportsApi';
import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import TeamLogo from '@/components/TeamLogo';
import { ChevronDown, ChevronUp, Loader2, AlertCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SPORTS = ['NBA', 'NFL', 'MLB', 'NHL'] as const;
type Sport = typeof SPORTS[number];

function formatOdds(odds: number): string {
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

// Split outcomes into two columns
function splitColumns<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

interface FuturesCardProps {
  market: FuturesMarket;
  sport: Sport;
  onBet: (outcome: FuturesOutcome, market: FuturesMarket) => void;
}

function FuturesCard({ market, sport, onBet }: FuturesCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [leftCol, rightCol] = splitColumns(market.outcomes);

  return (
    <div className="mb-4 bg-[#0d0f10] border border-[#1e2124] rounded-lg overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1d1f] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#53d337]" />
          <span className="text-white font-bold text-base">{market.label}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[#b1bad3]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#b1bad3]" />
        )}
      </button>

      {expanded && (
        <>
          {/* Sub-header */}
          <div className="px-4 py-1.5 bg-[#0a0c0d] border-t border-[#1e2124]">
            <p className="text-[#b1bad3] text-xs">{market.description}</p>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-2 divide-x divide-[#1e2124] border-t border-[#1e2124]">
            {[leftCol, rightCol].map((col, ci) => (
              <div key={ci} className="divide-y divide-[#1e2124]">
                {col.map((outcome) => (
                  <button
                    key={outcome.name}
                    onClick={() => onBet(outcome, market)}
                    className="w-full flex flex-col items-center justify-center py-3 px-4 hover:bg-[#1a1d1f] transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1 w-full justify-center">
                      <TeamLogo teamName={outcome.name} sport={sport} size="sm" />
                      <span className="text-[#b1bad3] text-sm group-hover:text-white transition-colors text-center leading-tight">
                        {outcome.name}
                      </span>
                    </div>
                    <span className="text-[#53d337] font-bold text-base">{formatOdds(outcome.odds)}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Futures() {
  const [sport, setSport] = useState<Sport>('NBA');
  const [markets, setMarkets] = useState<FuturesMarket[]>([]);
  const [activeTab, setActiveTab] = useState('Champion');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToBetSlip } = useBetting();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadFutures();
  }, [sport]);

  const loadFutures = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFutures(sport);
      setMarkets(data);
      if (data.length > 0) setActiveTab(data[0].label);
    } catch {
      setError('Could not load futures. Please check your Odds API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleBet = (outcome: FuturesOutcome, market: FuturesMarket) => {
    if (!user) {
      toast.error('Please login to make picks', {
        action: { label: 'Login', onClick: () => navigate('/login') },
      });
      return;
    }
    // Build a synthetic game object for the bet slip
    const syntheticGame = {
      id: `future-${market.key}-${outcome.name.replace(/\s+/g, '-')}`,
      homeTeam: outcome.name,
      awayTeam: `${market.description}`,
      homeOdds: 1.0,
      awayOdds: 1.0,
      sport: market.sport,
      startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // future
      isLive: false,
      status: 'scheduled' as const,
    };
    const decimalOdds = outcome.odds >= 0 ? (outcome.odds / 100) + 1 : (100 / Math.abs(outcome.odds)) + 1;
    addToBetSlip(syntheticGame as Game, 'home', decimalOdds);
    toast.success(`Added: ${outcome.name} — ${market.label} ${formatOdds(outcome.odds)}`);
  };

  // Tab labels from loaded markets
  const tabLabels = markets.map(m => m.label);

  // Find the currently viewed market
  const activeMarket = markets.find(m => m.label === activeTab) || markets[0];

  // Championship-style tabs like screenshot 1: Champion, Wins, Playoffs, Play In
  const STATIC_TABS = ['Champion', 'Division Winner', 'Conference Winner', 'Season Wins'];
  const displayTabs = tabLabels.length > 0 ? tabLabels : STATIC_TABS;

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

      {/* Category pill tabs */}
      <div className="border-b border-[#1e2124] mb-5 overflow-x-auto">
        <div className="flex gap-2 px-4 py-3 min-w-max">
          {displayTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 text-xs font-bold tracking-wide uppercase transition-all whitespace-nowrap rounded-full border',
                activeTab === tab
                  ? 'bg-white text-black border-white'
                  : 'text-[#b1bad3] border-[#2a2d2f] hover:border-[#b1bad3] hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 text-[#53d337] animate-spin" />
            <span className="text-[#b1bad3]">Loading futures…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-white font-semibold">Futures Unavailable</p>
            <p className="text-[#b1bad3] text-sm max-w-sm">{error}</p>
          </div>
        ) : !activeMarket ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Trophy className="w-10 h-10 text-[#b1bad3]" />
            <p className="text-white font-semibold">No Futures Available</p>
            <p className="text-[#b1bad3] text-sm">No {sport} futures markets are open right now.</p>
          </div>
        ) : (
          <FuturesCard
            key={activeMarket.key}
            market={activeMarket}
            sport={sport}
            onBet={handleBet}
          />
        )}
      </div>
    </div>
  );
}
