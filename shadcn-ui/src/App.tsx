import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from '@/contexts/WalletContext';
import { BettingProvider } from '@/contexts/BettingContext';
import Index from './pages/Index';
import LiveBetting from './pages/LiveBetting';
import MyBets from './pages/MyBets';
import Wallet from './pages/Wallet';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <BettingProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/live" element={<LiveBetting />} />
              <Route path="/my-bets" element={<MyBets />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BettingProvider>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;