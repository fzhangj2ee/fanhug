import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { LogOut, Wallet, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface NavbarProps {
  onHomeClick?: () => void;
  isHomeActive?: boolean;
}

export default function Navbar({ onHomeClick, isHomeActive = true }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { balance } = useWallet();

  const isAdmin = user?.email === 'fzhangj2ee@gmail.com';

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-[#1a1d1f] border-b border-[#2a2d2f] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={onHomeClick}
              className="text-2xl font-bold text-white hover:text-[#53d337] transition-colors"
            >
              FanHug
            </button>
          </div>

          {/* Centered Navigation Links */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isHomeActive ? 'text-[#53d337]' : 'text-[#b1bad3] hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/my-bets"
              className="text-sm font-medium text-[#b1bad3] hover:text-white transition-colors"
            >
              My Bets
            </Link>
            <Link
              to="/wallet"
              className="text-sm font-medium text-[#b1bad3] hover:text-white transition-colors"
            >
              Wallet
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium text-[#b1bad3] hover:text-white transition-colors flex items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-[#0d0f10] px-4 py-2 rounded-lg">
                  <Wallet className="h-4 w-4 text-[#53d337]" />
                  <span className="text-white font-medium">${balance.toFixed(2)}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-[#2a2d2f]">
                      {user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1a1d1f] border-[#2a2d2f]">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-white hover:bg-[#2a2d2f] cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-[#53d337] hover:bg-[#45b82d] text-white">
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
