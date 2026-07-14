'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Credenziali errate');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="glass-panel-premium rounded-2xl p-8 light-bleed space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">load.tube</h1>
            <p className="text-sm text-on-surface-variant mt-2">Accedi con le tue credenziali</p>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition"
          />
          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={!username || !password || loading}
            className="w-full bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-semibold text-sm py-3 rounded-xl liquid-hover spring-transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
