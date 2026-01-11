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
      const parsed = JSON.parse(saved);
      // Ensure balance is a number, not a string
      return {
        balance: Number(parsed.balance),
        transactions: parsed.transactions,
      };
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
    const numAmount = Number(amount);
    const newBalance = Number(walletState.balance) + numAmount;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount: numAmount,
      description: 'Added funds',
      timestamp: new Date().toISOString(),
      balance: newBalance,
    };

    setWalletState({
      balance: newBalance,
      transactions: [transaction, ...walletState.transactions],
    });
  };

  const placeBet = (amount: number, description: string): boolean => {
    const numAmount = Number(amount);
    const currentBalance = Number(walletState.balance);
    
    console.log('=== PLACE BET WALLET CHECK ===');
    console.log('Amount to bet:', numAmount, 'Type:', typeof numAmount);
    console.log('Current balance:', currentBalance, 'Type:', typeof currentBalance);
    console.log('Has sufficient funds:', currentBalance >= numAmount);
    
    if (currentBalance < numAmount) {
      console.log('FAILED: Insufficient balance');
      return false;
    }

    const newBalance = currentBalance - numAmount;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'bet_placed',
      amount: -numAmount,
      description,
      timestamp: new Date().toISOString(),
      balance: newBalance,
    };

    setWalletState({
      balance: newBalance,
      transactions: [transaction, ...walletState.transactions],
    });
    
    console.log('SUCCESS: Bet placed, new balance:', newBalance);
    return true;
  };

  const settleBet = (amount: number, won: boolean, description: string) => {
    const numAmount = Number(amount);
    const currentBalance = Number(walletState.balance);
    const newBalance = won ? currentBalance + numAmount : currentBalance;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: won ? 'bet_won' : 'bet_lost',
      amount: won ? numAmount : 0,
      description,
      timestamp: new Date().toISOString(),
      balance: newBalance,
    };

    setWalletState({
      balance: newBalance,
      transactions: [transaction, ...walletState.transactions],
    });
  };

  return (
    <WalletContext.Provider
      value={{
        balance: Number(walletState.balance),
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