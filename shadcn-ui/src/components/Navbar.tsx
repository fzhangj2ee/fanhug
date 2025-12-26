import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Receipt, Wallet as WalletIcon, LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-[#0d0f10] border-b border-[#1a1d1f] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-[#53d337]" />
            <span className="text-xl font-bold text-white">BetPro</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Button
              asChild
              variant="ghost"
              className={`${
                isActive('/')
                  ? 'text-[#53d337] bg-[#53d337]/10'
                  : 'text-[#8B949E] hover:text-white hover:bg-[#1a1d1f]'
              }`}
            >
              <Link to="/">
                <Trophy className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={`${
                isActive('/live')
                  ? 'text-[#53d337] bg-[#53d337]/10'
                  : 'text-[#8B949E] hover:text-white hover:bg-[#1a1d1f]'
              }`}
            >
              <Link to="/live">
                <Zap className="h-4 w-4 mr-2" />
                Live
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={`${
                isActive('/my-bets')
                  ? 'text-[#53d337] bg-[#53d337]/10'
                  : 'text-[#8B949E] hover:text-white hover:bg-[#1a1d1f]'
              }`}
            >
              <Link to="/my-bets">
                <Receipt className="h-4 w-4 mr-2" />
                My Bets
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={`${
                isActive('/wallet')
                  ? 'text-[#53d337] bg-[#53d337]/10'
                  : 'text-[#8B949E] hover:text-white hover:bg-[#1a1d1f]'
              }`}
            >
              <Link to="/wallet">
                <WalletIcon className="h-4 w-4 mr-2" />
                Wallet
              </Link>
            </Button>

            {/* Authentication Section */}
            <div className="ml-4 pl-4 border-l border-[#2a2d2f]">
              {!user ? (
                <Button
                  asChild
                  className="bg-[#53d337] hover:bg-[#45b82d] text-black font-bold"
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-[#8B949E] hover:text-white hover:bg-[#1a1d1f]"
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span className="max-w-[150px] truncate">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#1a1d1f] border-[#2a2d2f] w-56"
                  >
                    <DropdownMenuLabel className="text-white">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#2a2d2f]" />
                    <DropdownMenuItem
                      asChild
                      className="text-[#b1bad3] hover:text-white hover:bg-[#2a2d2f] cursor-pointer"
                    >
                      <Link to="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-[#b1bad3] hover:text-white hover:bg-[#2a2d2f] cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}