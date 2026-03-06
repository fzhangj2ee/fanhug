import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types/betting';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addFunds: (amount: number) => void;
  placeBet: (amount: number, description: string) => boolean;
  settleBet: (amount: number, won: boolean, description: string) => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const INITIAL_BALANCE = 10000;

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const txns: Transaction[] = data.map((row) => ({
          id: row.id,
          type: row.type,
          amount: Number(row.amount),
          description: row.description,
          timestamp: new Date(row.created_at),
          balance: Number(row.balance_after),
        }));
        setTransactions(txns);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }, [user]);

  // Load wallet from Supabase when user logs in
  const loadWallet = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: walletData, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No wallet found — create one with the welcome bonus
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: INITIAL_BALANCE })
          .select()
          .single();

        if (!createError && newWallet) {
          setBalance(Number(newWallet.balance));
          await supabase.from('wallet_transactions').insert({
            user_id: user.id,
            type: 'deposit',
            amount: INITIAL_BALANCE,
            description: 'Welcome bonus',
            balance_after: INITIAL_BALANCE,
          });
          await loadTransactions();
        }
      } else if (!error && walletData) {
        setBalance(Number(walletData.balance));
        await loadTransactions();
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, loadTransactions]);

  // One-time migration from localStorage to Supabase
  const migrateLocalStorageWallet = useCallback(async () => {
    if (!user) return;
    const migrated = localStorage.getItem('wallet_supabase_migration_done');
    if (migrated) return;

    const savedWallet = localStorage.getItem('wallet');
    if (!savedWallet) {
      localStorage.setItem('wallet_supabase_migration_done', 'true');
      return;
    }

    try {
      const parsed = JSON.parse(savedWallet);
      const localBalance = Number(parsed.balance);

      const { data: existing } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!existing && localBalance !== INITIAL_BALANCE) {
        await supabase.from('wallets').upsert({ user_id: user.id, balance: localBalance });
        setBalance(localBalance);
      }
    } catch (err) {
      console.error('Wallet migration error:', err);
    } finally {
      localStorage.setItem('wallet_supabase_migration_done', 'true');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      migrateLocalStorageWallet().then(() => loadWallet());
    } else {
      setBalance(INITIAL_BALANCE);
      setTransactions([]);
    }
  }, [user, loadWallet, migrateLocalStorageWallet]);

  const updateBalanceInSupabase = async (newBalance: number) => {
    if (!user) return;
    await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id);
  };

  const recordTransaction = async (
    type: string,
    amount: number,
    description: string,
    newBalance: number
  ) => {
    if (!user) return;
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type,
      amount,
      description,
      balance_after: newBalance,
    });
  };

  const addFunds = (amount: number) => {
    const numAmount = Number(amount);
    const newBalance = balance + numAmount;
    setBalance(newBalance);
    const newTxn: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount: numAmount,
      description: 'Added funds',
      timestamp: new Date(),
      balance: newBalance,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    updateBalanceInSupabase(newBalance);
    recordTransaction('deposit', numAmount, 'Added funds', newBalance);
  };

  const placeBet = (amount: number, description: string): boolean => {
    const numAmount = Number(amount);
    if (balance < numAmount) return false;

    const newBalance = balance - numAmount;
    setBalance(newBalance);
    const newTxn: Transaction = {
      id: Date.now().toString(),
      type: 'bet_placed',
      amount: -numAmount,
      description,
      timestamp: new Date(),
      balance: newBalance,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    updateBalanceInSupabase(newBalance);
    recordTransaction('bet_placed', -numAmount, description, newBalance);
    return true;
  };

  const settleBet = (amount: number, won: boolean, description: string) => {
    if (!won) return;
    const numAmount = Number(amount);
    const newBalance = balance + numAmount;
    setBalance(newBalance);
    const newTxn: Transaction = {
      id: Date.now().toString(),
      type: 'bet_won',
      amount: numAmount,
      description,
      timestamp: new Date(),
      balance: newBalance,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    updateBalanceInSupabase(newBalance);
    recordTransaction('bet_won', numAmount, description, newBalance);
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, addFunds, placeBet, settleBet, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
