'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  username: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
  loading: true,
  username: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('site_token');
    const savedUsername = localStorage.getItem('site_username');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setIsAuthenticated(true);
          if (savedUsername) setUsername(savedUsername);
        } else {
          localStorage.removeItem('site_token');
          localStorage.removeItem('site_username');
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('site_token');
        localStorage.removeItem('site_username');
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('site_token', data.data.token);
        localStorage.setItem('site_username', data.data.username);
        setUsername(data.data.username);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Connection error' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('site_token');
    localStorage.removeItem('site_username');
    setUsername(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, username }}>
      {children}
    </AuthContext.Provider>
  );
}
