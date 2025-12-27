import { createContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('all_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('all_users', JSON.stringify(users));
    }
  }, [users]);

  // Save current user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple authentication - check if user exists
    const existingUser = users.find((u) => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      return true;
    }
    
    return false;
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random()}`,
      email,
      balance: 1000, // Starting balance
    };

    setUsers([...users, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    users,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}