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

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleCredential = useCallback(async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('site_token', data.data.token);
        localStorage.setItem('site_email', data.data.email);
        localStorage.setItem('site_role', data.data.role);
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

  useEffect(() => {
    const token = localStorage.getItem('site_token');
    const savedEmail = localStorage.getItem('site_email');
    const savedRole = localStorage.getItem('site_role');

    if (token) {
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setIsAuthenticated(true);
            if (savedEmail) setEmail(savedEmail);
            if (savedRole) setRole(savedRole);
          } else {
            localStorage.removeItem('site_token');
            localStorage.removeItem('site_email');
            localStorage.removeItem('site_role');
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('site_token');
          localStorage.removeItem('site_email');
          localStorage.removeItem('site_role');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || isAuthenticated || !clientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => { handleCredential(response.credential); },
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        window.google.accounts.id.prompt();
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [loading, isAuthenticated, clientId, handleCredential]);

  const googleLogin = useCallback(async (credential: string) => {
    return handleCredential(credential);
  }, [handleCredential]);

  const logout = useCallback(() => {
    localStorage.removeItem('site_token');
    localStorage.removeItem('site_email');
    localStorage.removeItem('site_role');
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
