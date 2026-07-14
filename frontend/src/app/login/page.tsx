'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setRedirecting(true);
      setTimeout(() => router.push('/'), 600);
    }
  }, [isAuthenticated, authLoading, router]);

  if (redirecting) {
    return (
      <div className="flex-grow flex items-center justify-center px-6">
        <div className="glass-panel-premium rounded-2xl p-8 light-bleed text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-on-surface-variant">Reindirizzamento in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="glass-panel-premium rounded-2xl p-8 light-bleed text-center space-y-5">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">load.tube</h1>
          <p className="text-sm text-on-surface-variant">Clicca il profilo Google che appare sopra per accedere</p>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    </div>
  );
}
