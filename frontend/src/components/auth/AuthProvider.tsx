'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  email: string | null;
  role: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  googleLogin: async () => ({ success: false }),
  logout: () => {},
  loading: true,
  email: null,
  role: null,
  isAdmin: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 1): void {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmail = getCookie('site_email');
    const savedRole = getCookie('site_role');

    fetch('/api/auth/verify', { method: 'POST', credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setIsAuthenticated(true);
          if (savedEmail) setEmail(savedEmail);
          if (savedRole) setRole(savedRole);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (data.success) {
        setEmail(data.data.email);
        setRole(data.data.role);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Accesso non autorizzato' };
    } catch {
      return { success: false, error: 'Errore di connessione' };
    }
  }, []);

  const logout = useCallback(() => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    removeCookie('site_email');
    removeCookie('site_role');
    setEmail(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, googleLogin, logout, loading, email, role, isAdmin: role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
