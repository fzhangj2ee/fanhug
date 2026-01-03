import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, MessageSquare } from 'lucide-react';
import PlayMoney from '@/components/PlayMoney';
import { useWallet } from '@/contexts/WalletContext';
import { useMessages } from '@/contexts/MessagesContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageForm } from '@/components/MessageForm';
import { useState } from 'react';

// Dynamic version number from build environment variable
const APP_VERSION = import.meta.env.VITE_BUILD_NUMBER ? `v${import.meta.env.VITE_BUILD_NUMBER}` : 'v1';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useMessages();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user?.email === 'fzhangj2ee@gmail.com';

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Left: Logo and Version */}
          <div className="flex-shrink-0 flex items-center gap-3 w-48">
            <button onClick={() => navigate('/')} className="flex items-center">
              <img 
                src="/images/FanHug.png" 
                alt="FanHug Logo" 
                className="h-20 w-auto"
              />
            </button>
            <span className="text-xs text-gray-400 font-mono">
              {APP_VERSION}
            </span>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className={`${
                  isActive('/')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/live')}
                className={`${
                  isActive('/live')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Live
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-bets')}
                className={`${
                  isActive('/my-bets')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                My Bets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet')}
                className={`${
                  isActive('/wallet')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Wallet
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/donation')}
                className={`${
                  isActive('/donation')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                Donation
              </Button>
              {user && (
                <>
                  {isAdmin ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className={`${
                        isActive('/admin')
                          ? 'text-white bg-gray-800'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      } relative`}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ) : (
                    <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Send Message to Admin</DialogTitle>
                        </DialogHeader>
                        <MessageForm onSuccess={() => setMessageDialogOpen(false)} />
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Username, Balance, and Auth */}
          <div className="flex items-center space-x-3 w-48 justify-end">
            {user ? (
              <>
                <span className="text-gray-300 text-sm font-medium hidden md:inline">
                  {user.email?.split('@')[0] || 'User'}
                </span>
                <button onClick={() => navigate('/wallet')}>
                  <div className="flex items-center px-3 py-2 bg-gray-800 rounded-md border border-green-500 hover:bg-gray-700 transition-colors cursor-pointer">
                    <PlayMoney amount={balance} className="text-green-500 font-semibold" />
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="bg-green-500 hover:bg-green-600 text-black font-bold"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}