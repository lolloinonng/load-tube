'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [error] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex-grow flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="glass-panel-premium rounded-2xl p-8 light-bleed space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">load.tube</h1>
            <p className="text-sm text-on-surface-variant mt-2">Accedi con Google per utilizzare il sito</p>
          </div>
          {error && (
            <p className="text-xs text-red-400 font-medium text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
