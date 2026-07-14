'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

export default function LoginPage() {
  const [logging, setLogging] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  if (logging) {
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
      <GoogleOneTap onLogging={setLogging} />
      <div className="w-full max-w-sm">
        <div className="glass-panel-premium rounded-2xl p-8 light-bleed text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">load.tube</h1>
          <p className="text-sm text-on-surface-variant mt-2">Rilevamento account Google in corso...</p>
        </div>
      </div>
    </div>
  );
}
