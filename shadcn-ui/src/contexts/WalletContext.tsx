import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletState, Transaction } from '@/types/betting';

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addFunds: (amount: number) => void;
  placeBet: (amount: number, description: string) => boolean;
  settleBet: (amount: number, won: boolean, description: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const INITIAL_BALANCE = 10000; // Starting virtual currency

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>(() => {
    const saved = localStorage.getItem('wallet');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      balance: INITIAL_BALANCE,
      transactions: [
        {
          id: '1',
          type: 'deposit',
          amount: INITIAL_BALANCE,
          description: 'Welcome bonus',
          timestamp: new Date().toISOString(),
          balance: INITIAL_BALANCE,
        },
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem('wallet', JSON.stringify(walletState));
  }, [walletState]);

  const addFunds = (amount: number) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      description: 'Added funds',
      timestamp: new Date().toISOString(),
      balance: walletState.balance + amount,
    };

    setWalletState({
      balance: walletState.balance + amount,
      transactions: [transaction, ...walletState.transactions],
    });
  };

  const placeBet = (amount: number, description: string): boolean => {
    if (amount > walletState.balance) {
      return false;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'bet_placed',
      amount: -amount,
      description,
      timestamp: new Date().toISOString(),
      balance: walletState.balance - amount,
    };

    setWalletState({
      balance: walletState.balance - amount,
      transactions: [transaction, ...walletState.transactions],
    });

    return true;
  };

  const settleBet = (amount: number, won: boolean, description: string) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: won ? 'bet_won' : 'bet_lost',
      amount: won ? amount : 0,
      description,
      timestamp: new Date().toISOString(),
      balance: won ? walletState.balance + amount : walletState.balance,
    };

    setWalletState({
      balance: won ? walletState.balance + amount : walletState.balance,
      transactions: [transaction, ...walletState.transactions],
    });
  };

  return (
    <WalletContext.Provider
      value={{
        balance: walletState.balance,
        transactions: walletState.transactions,
        addFunds,
        placeBet,
        settleBet,
      }}
    >
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