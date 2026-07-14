'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string; shape: string; width: string }) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const { googleLogin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: async (response) => {
            setError('');
            const result = await googleLogin(response.credential);
            if (result.success) {
              router.push('/');
            } else {
              setError(result.error || 'Accesso non autorizzato');
            }
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: '320',
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [isAuthenticated, googleLogin, router]);

  return (
    <div className="flex-grow flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="glass-panel-premium rounded-2xl p-8 light-bleed space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">load.tube</h1>
            <p className="text-sm text-on-surface-variant mt-2">Accedi con Google</p>
          </div>
          <div className="flex justify-center" ref={buttonRef} />
          {error && (
            <p className="text-xs text-red-400 font-medium text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
