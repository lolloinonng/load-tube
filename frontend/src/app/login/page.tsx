'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (ok) {
      router.push('/');
    } else {
      setError('Password errata');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="glass-panel-premium rounded-2xl p-8 light-bleed space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">load.tube</h1>
            <p className="text-sm text-on-surface-variant mt-2">Inserisci la password per accedere</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition"
          />
          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            className="w-full bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-semibold text-sm py-3 rounded-xl liquid-hover spring-transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifica...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
