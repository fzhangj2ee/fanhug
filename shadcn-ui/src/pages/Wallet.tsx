import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Wallet as WalletIcon } from 'lucide-react';
import { toast } from 'sonner';
import PlayMoney from '@/components/PlayMoney';

export default function Wallet() {
  const navigate = useNavigate();
  const { balance, transactions, addFunds } = useWallet();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAddFunds = () => {
    addFunds(1000);
    toast.success('Added play money to your balance!');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-[#00C853]" />;
      case 'bet_won':
        return <TrendingUp className="h-4 w-4 text-[#00C853]" />;
      case 'bet_placed':
      case 'bet_lost':
        return <TrendingDown className="h-4 w-4 text-[#FF3B30]" />;
      default:
        return <WalletIcon className="h-4 w-4 text-[#8B949E]" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'bet_won':
        return 'text-[#00C853]';
      case 'bet_placed':
      case 'bet_lost':
        return 'text-[#FF3B30]';
      default:
        return 'text-[#8B949E]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <Navbar onHomeClick={handleHomeClick} isHomeActive={false} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Wallet</h1>

        <Card className="bg-gradient-to-br from-[#00C853] to-[#00E676] border-0 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-2">Available Balance</p>
                <PlayMoney amount={balance} className="text-white text-5xl font-bold" />
              </div>
              <Button
                onClick={handleAddFunds}
                className="bg-white text-[#00C853] hover:bg-white/90"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Funds
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1C2128] border-[#2A2F36]">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8B949E] text-lg">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg hover:bg-[#1A1F26] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#1C2128] p-2 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-[#8B949E] text-sm">{formatDate(transaction.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount >= 0 ? '+' : ''}
                        <PlayMoney amount={Math.abs(transaction.amount)} className="inline-flex" />
                      </p>
                      <p className="text-[#8B949E] text-sm flex items-center justify-end">
                        Balance: <PlayMoney amount={transaction.balance} className="ml-1" />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}