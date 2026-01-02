import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';
import PlayMoney from '@/components/PlayMoney';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Wallet() {
  const { balance, transactions } = useWallet();

  return (
    <div className="min-h-screen bg-gray-950 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">My Wallet</h1>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-[#00C853] to-[#00E676] border-0 mb-8">
          <CardContent className="p-8">
            <div>
              <p className="text-white/80 text-sm mb-2">Available Balance</p>
              <PlayMoney amount={balance} className="text-white text-5xl font-bold" />
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'deposit'
                            ? 'bg-green-500/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        {transaction.type === 'deposit' ? (
                          <ArrowDownRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        transaction.type === 'deposit'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}
                      <PlayMoney amount={transaction.amount} />
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