import { createContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as authService from '@/lib/auth';
import type { Provider } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, metadata?: { fullName?: string; username?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
  users: User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Load all users from localStorage for admin functionality
        const savedUsers = localStorage.getItem('all_registered_users');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        }
        
        // Add current user to users list if not already there
        if (initialSession?.user) {
          setUsers(prevUsers => {
            const userExists = prevUsers.some(u => u.id === initialSession.user.id);
            if (!userExists) {
              const updatedUsers = [...prevUsers, initialSession.user];
              localStorage.setItem('all_registered_users', JSON.stringify(updatedUsers));
              return updatedUsers;
            }
            return prevUsers;
          });
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
      
      // Update users list when user signs in
      if (newSession?.user) {
        setUsers(prevUsers => {
          const userExists = prevUsers.some(u => u.id === newSession.user.id);
          if (!userExists) {
            const updatedUsers = [...prevUsers, newSession.user];
            localStorage.setItem('all_registered_users', JSON.stringify(updatedUsers));
            return updatedUsers;
          }
          return prevUsers;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (err: unknown) => {
    const authError = err as AuthError;
    let errorMessage = 'An error occurred';

    if (authError.message) {
      // Map common Supabase error messages to user-friendly messages
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address';
      } else if (authError.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists';
      } else if (authError.message.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 8 characters';
      } else {
        errorMessage = authError.message;
      }
    }

    setError(errorMessage);
    throw new Error(errorMessage);
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { fullName?: string; username?: string }
  ) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signUp({
        email,
        password,
        fullName: metadata?.fullName,
        username: metadata?.username,
      });
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signIn({ email, password });
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: Provider) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithOAuth(provider);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.updatePassword(newPassword);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    users,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}