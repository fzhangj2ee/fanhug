import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { BettingProvider } from '@/contexts/BettingContext';
import { LiveOddsProvider } from '@/contexts/LiveOddsContext';
import Index from './pages/Index';
import MyBets from './pages/MyBets';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import NotFound from './pages/NotFound';

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
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/my-bets" element={<MyBets />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </LiveOddsProvider>
            </BettingProvider>
          </WalletProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;