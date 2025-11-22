import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  id: string;
}

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem('users');
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      // Check if user already exists
      if (users.find((u: StoredUser) => u.email === email)) {
        return false;
      }

      // Create new user
      const newUser: StoredUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password, // In production, this should be hashed
        name,
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Auto login after signup
      const userSession = { id: newUser.id, email: newUser.email, name: newUser.name };
      setUser(userSession);
      localStorage.setItem('user', JSON.stringify(userSession));

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersData = localStorage.getItem('users');
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      const foundUser = users.find((u: StoredUser) => u.email === email && u.password === password);

      if (foundUser) {
        const userSession = { id: foundUser.id, email: foundUser.email, name: foundUser.name };
        setUser(userSession);
        localStorage.setItem('user', JSON.stringify(userSession));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}