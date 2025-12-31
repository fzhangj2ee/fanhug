import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { BettingProvider } from '@/contexts/BettingContext';
import { LiveOddsProvider } from '@/contexts/LiveOddsContext';
import Index from './pages/Index';
import Live from './pages/Live';
import Login from './pages/Login';
import MyBets from './pages/MyBets';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import Donation from './pages/Donation';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import BetSlip from './components/BetSlip';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <WalletProvider>
            <BettingProvider>
              <LiveOddsProvider>
                <div className="min-h-screen bg-gray-950">
                  <Navbar />
                  <div className="flex">
                    <div className="flex-1">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/live" element={<Live />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/my-bets" element={<MyBets />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/donation" element={<Donation />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <div className="hidden lg:block w-96 p-6">
                      <BetSlip />
                    </div>
                  </div>
                </div>
              </LiveOddsProvider>
            </BettingProvider>
          </WalletProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;