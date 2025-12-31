import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, Radio, Wallet } from 'lucide-react';
import PlayMoney from '@/components/PlayMoney';
import { useWallet } from '@/contexts/WalletContext';

// Dynamic version number from build environment variable
const APP_VERSION = import.meta.env.VITE_BUILD_NUMBER ? `v${import.meta.env.VITE_BUILD_NUMBER}` : 'v1';

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { balance } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Left: Logo and Version */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <img 
                src="/fanhug-logo.png" 
                alt="FanHug Logo" 
                className="h-20 w-auto"
              />
            </Link>
            <span className="text-xs text-gray-400 font-mono">
              {APP_VERSION}
            </span>
          </div>

          {/* Center: Navigation Links */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
            <Link to="/">
              <Button
                variant="ghost"
                className={`${
                  isActive('/')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Home
              </Button>
            </Link>
            <Link to="/live">
              <Button
                variant="ghost"
                className={`${
                  isActive('/live')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                } flex items-center gap-2`}
              >
                <Radio className="h-4 w-4" />
                Live
              </Button>
            </Link>
            <Link to="/my-bets">
              <Button
                variant="ghost"
                className={`${
                  isActive('/my-bets')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                My Bets
              </Button>
            </Link>
            <Link to="/wallet">
              <Button
                variant="ghost"
                className={`${
                  isActive('/wallet')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                } flex items-center gap-2`}
              >
                <Wallet className="h-4 w-4" />
                Wallet
              </Button>
            </Link>
          </div>

          {/* Right: Wallet Balance and Auth */}
          <div className="flex items-center space-x-4">
            <Link to="/donation">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400 hover:bg-gray-800"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            {user ? (
              <>
                <div className="flex items-center px-3 py-2 bg-gray-800 rounded-md border border-green-500">
                  <PlayMoney amount={balance} className="text-green-500 font-semibold" />
                </div>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-green-500 hover:bg-green-600 text-black font-bold">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}