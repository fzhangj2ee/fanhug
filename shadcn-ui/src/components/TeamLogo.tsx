import { cn } from '@/lib/utils';

interface TeamLogoProps {
  teamName: string;
  sport: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Team logo mapping using ESPN's CDN
const getTeamLogoUrl = (teamName: string, sport: string): string => {
  const sportMap: Record<string, string> = {
    'NFL': 'nfl',
    'NBA': 'nba',
    'MLB': 'mlb',
    'NHL': 'nhl',
    'Soccer': 'soccer'
  };

  const sportPath = sportMap[sport] || 'nfl';

  // Team ID mapping for major leagues
  const teamIds: Record<string, Record<string, string>> = {
    // NFL Teams
    'nfl': {
      'Arizona Cardinals': '22',
      'Atlanta Falcons': '1',
      'Baltimore Ravens': '33',
      'Buffalo Bills': '2',
      'Carolina Panthers': '29',
      'Chicago Bears': '3',
      'Cincinnati Bengals': '4',
      'Cleveland Browns': '5',
      'Dallas Cowboys': '6',
      'Denver Broncos': '7',
      'Detroit Lions': '8',
      'Green Bay Packers': '9',
      'Houston Texans': '34',
      'Indianapolis Colts': '11',
      'Jacksonville Jaguars': '30',
      'Kansas City Chiefs': '12',
      'Las Vegas Raiders': '13',
      'Los Angeles Chargers': '24',
      'Los Angeles Rams': '14',
      'Miami Dolphins': '15',
      'Minnesota Vikings': '16',
      'New England Patriots': '17',
      'New Orleans Saints': '18',
      'New York Giants': '19',
      'New York Jets': '20',
      'Philadelphia Eagles': '21',
      'Pittsburgh Steelers': '23',
      'San Francisco 49ers': '25',
      'Seattle Seahawks': '26',
      'Tampa Bay Buccaneers': '27',
      'Tennessee Titans': '10',
      'Washington Commanders': '28'
    },
    // NBA Teams
    'nba': {
      'Atlanta Hawks': '1',
      'Boston Celtics': '2',
      'Brooklyn Nets': '17',
      'Charlotte Hornets': '30',
      'Chicago Bulls': '4',
      'Cleveland Cavaliers': '5',
      'Dallas Mavericks': '6',
      'Denver Nuggets': '7',
      'Detroit Pistons': '8',
      'Golden State Warriors': '9',
      'Houston Rockets': '10',
      'Indiana Pacers': '11',
      'Los Angeles Clippers': '12',
      'Los Angeles Lakers': '13',
      'Memphis Grizzlies': '29',
      'Miami Heat': '14',
      'Milwaukee Bucks': '15',
      'Minnesota Timberwolves': '16',
      'New Orleans Pelicans': '3',
      'New York Knicks': '18',
      'Oklahoma City Thunder': '25',
      'Orlando Magic': '19',
      'Philadelphia 76ers': '20',
      'Phoenix Suns': '21',
      'Portland Trail Blazers': '22',
      'Sacramento Kings': '23',
      'San Antonio Spurs': '24',
      'Toronto Raptors': '28',
      'Utah Jazz': '26',
      'Washington Wizards': '27'
    },
    // MLB Teams
    'mlb': {
      'Arizona Diamondbacks': '29',
      'Atlanta Braves': '15',
      'Baltimore Orioles': '1',
      'Boston Red Sox': '2',
      'Chicago Cubs': '16',
      'Chicago White Sox': '4',
      'Cincinnati Reds': '17',
      'Cleveland Guardians': '5',
      'Colorado Rockies': '27',
      'Detroit Tigers': '6',
      'Houston Astros': '18',
      'Kansas City Royals': '7',
      'Los Angeles Angels': '3',
      'Los Angeles Dodgers': '19',
      'Miami Marlins': '28',
      'Milwaukee Brewers': '8',
      'Minnesota Twins': '9',
      'New York Mets': '21',
      'New York Yankees': '10',
      'Oakland Athletics': '11',
      'Philadelphia Phillies': '22',
      'Pittsburgh Pirates': '23',
      'San Diego Padres': '25',
      'San Francisco Giants': '26',
      'Seattle Mariners': '12',
      'St. Louis Cardinals': '24',
      'Tampa Bay Rays': '30',
      'Texas Rangers': '13',
      'Toronto Blue Jays': '14',
      'Washington Nationals': '20'
    },
    // NHL Teams
    'nhl': {
      'Anaheim Ducks': '24',
      'Arizona Coyotes': '53',
      'Boston Bruins': '6',
      'Buffalo Sabres': '7',
      'Calgary Flames': '20',
      'Carolina Hurricanes': '12',
      'Chicago Blackhawks': '16',
      'Colorado Avalanche': '21',
      'Columbus Blue Jackets': '29',
      'Dallas Stars': '25',
      'Detroit Red Wings': '17',
      'Edmonton Oilers': '22',
      'Florida Panthers': '13',
      'Los Angeles Kings': '26',
      'Minnesota Wild': '30',
      'Montreal Canadiens': '8',
      'Nashville Predators': '18',
      'New Jersey Devils': '1',
      'New York Islanders': '2',
      'New York Rangers': '3',
      'Ottawa Senators': '9',
      'Philadelphia Flyers': '4',
      'Pittsburgh Penguins': '5',
      'San Jose Sharks': '28',
      'Seattle Kraken': '55',
      'St. Louis Blues': '19',
      'Tampa Bay Lightning': '14',
      'Toronto Maple Leafs': '10',
      'Vancouver Canucks': '23',
      'Vegas Golden Knights': '37',
      'Washington Capitals': '15',
      'Winnipeg Jets': '52'
    }
  };

  const teamId = teamIds[sportPath]?.[teamName];
  
  if (teamId) {
    return `https://a.espncdn.com/i/teamlogos/${sportPath}/500/${teamId}.png`;
  }

  // Fallback: return a generic placeholder
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/${sportPath}/500/scoreboard/${teamName.replace(/\s+/g, '')}.png&h=40&w=40`;
};

export default function TeamLogo({ teamName, sport, size = 'md', className }: TeamLogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const logoUrl = getTeamLogoUrl(teamName, sport);

  return (
    <div className={cn(
      'flex items-center justify-center rounded overflow-hidden bg-white',
      sizeClasses[size],
      className
    )}>
      <img
        src={logoUrl}
        alt={`${teamName} logo`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to abbreviation if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.className = cn(
              parent.className,
              'bg-[#1a1d1f]'
            );
            const parts = teamName.split(' ');
            const abbr = parts[parts.length - 1].substring(0, 3).toUpperCase();
            parent.innerHTML = `<span class="text-[10px] font-bold text-[#b1bad3]">${abbr}</span>`;
          }
        }}
      />
    </div>
  );
}