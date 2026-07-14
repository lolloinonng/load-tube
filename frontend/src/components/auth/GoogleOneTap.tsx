'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

export function GoogleOneTap({ onLogging }: { onLogging?: (v: boolean) => void }) {
  const { googleLogin, isAuthenticated, loading: authLoading } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (authLoading || isAuthenticated || calledRef.current) return;
    calledRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: async (response) => {
            onLogging?.(true);
            await googleLogin(response.credential);
          },
          cancel_on_tap_outside: false,
        });
        window.google.accounts.id.prompt();
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [authLoading, isAuthenticated, googleLogin, onLogging]);

  return null;
}
