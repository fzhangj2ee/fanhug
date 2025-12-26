import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, TrendingUp, History, Wallet } from 'lucide-react';

interface NavbarProps {
  onHomeClick?: () => void;
  isHomeActive?: boolean;
}

export default function Navbar({ onHomeClick, isHomeActive = true }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return isHomeActive;
    }
    return location.pathname === path;
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onHomeClick) {
      onHomeClick();
    }
  };

  return (
    <nav className="bg-[#0F1419] border-b border-[#2A2F36] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" onClick={handleHomeClick}>
            <img src="/assets/logo-betting.png" alt="Logo" className="h-8 w-8" />
            <span className="text-white text-xl font-bold">BetPro</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              className={isActive('/') ? 'bg-[#00C853] hover:bg-[#00E676]' : 'text-[#8B949E] hover:text-white'}
              onClick={handleHomeClick}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>

            <Button
              asChild
              variant={isActive('/live') ? 'default' : 'ghost'}
              className={isActive('/live') ? 'bg-[#00C853] hover:bg-[#00E676]' : 'text-[#8B949E] hover:text-white'}
            >
              <Link to="/live">
                <TrendingUp className="h-4 w-4 mr-2" />
                Live
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive('/my-bets') ? 'default' : 'ghost'}
              className={isActive('/my-bets') ? 'bg-[#00C853] hover:bg-[#00E676]' : 'text-[#8B949E] hover:text-white'}
            >
              <Link to="/my-bets">
                <History className="h-4 w-4 mr-2" />
                My Bets
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive('/wallet') ? 'default' : 'ghost'}
              className={isActive('/wallet') ? 'bg-[#00C853] hover:bg-[#00E676]' : 'text-[#8B949E] hover:text-white'}
            >
              <Link to="/wallet">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}