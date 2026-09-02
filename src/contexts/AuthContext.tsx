import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface Account {
  fullName: string;
  email: string;
  role: 'traveler' | 'admin';
}

interface AuthContextValue {
  account: Account | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ACCOUNT_KEY = 'yatrashield.account';
const USERS_KEY = 'yatrashield.users';
const DEMO_ADMIN: StoredUser = {
  fullName: 'YatraShield Demo Admin',
  email: 'admin@yatrashield.demo',
  password: 'Admin@12345',
  role: 'admin'
};

type StoredUser = Account & { password: string };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
    if (!users.some((user) => user.email === DEMO_ADMIN.email)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, DEMO_ADMIN]));
    }
  }, []);

  const [account, setAccount] = useState<Account | null>(() => {
    try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null') as Account | null; } catch { return null; }
  });

  useEffect(() => {
    if (account) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    else localStorage.removeItem(ACCOUNT_KEY);
  }, [account]);

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
    const user = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password);
    if (!user) throw new Error('Invalid email or password.');
    setAccount({ fullName: user.fullName, email: user.email, role: user.role });
  };

  const register = async (fullName: string, email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) throw new Error('An account already exists for this email.');
    const user: StoredUser = { fullName, email, password, role: 'traveler' };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    setAccount({ fullName, email, role: 'traveler' });
  };

  const value = useMemo(() => ({ account, login, register, logout: () => setAccount(null) }), [account]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
