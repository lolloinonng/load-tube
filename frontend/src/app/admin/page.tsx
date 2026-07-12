'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminLogin, getAdminStats, getAdminLogs } from '@/lib/api';
import type { AdminStats, AdminLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { Lock, Download, BarChart3, Activity, FileText } from 'lucide-react';

export default function AdminPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(credentials.username, credentials.password);
      if (res.success) {
        setToken(res.data.token);
        localStorage.setItem('admin_token', res.data.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [statsRes, logsRes] = await Promise.all([
        getAdminStats(token),
        getAdminLogs(token, 50),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success) setLogs(logsRes.data);
    } catch {
      setToken(null);
      localStorage.removeItem('admin_token');
    }
  }, [token]);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
    setStats(null);
    setLogs([]);
  };

  if (!token) {
    return (
      <div className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm glass-panel rounded-xl p-8 light-bleed fade-in-stagger delay-100">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-on-surface">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-wider text-on-surface-variant mb-1 block">Username</label>
              <input
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wider text-on-surface-variant mb-1 block">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-container to-[#8BB8D4] text-on-primary-container font-semibold text-sm px-6 py-2.5 rounded-full liquid-hover spring-transition shadow-lg disabled:opacity-40"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow px-6 py-8 w-full max-w-[720px] mx-auto">
      <div className="flex items-center justify-between mb-8 fade-in-stagger delay-100">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Admin</h1>
        <button
          onClick={handleLogout}
          className="text-xs font-bold tracking-wider text-on-surface-variant/70 hover:text-primary spring-transition"
        >
          Logout
        </button>
      </div>

      {!stats ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12">
            <svg fill="none" stroke="#4a6171" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.5.55 2.87 1.46 3.92" strokeDasharray="2 2">
                <animateTransform attributeName="transform" dur="2s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate" />
              </path>
            </svg>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 fade-in-stagger delay-200">
            <div className="glass-panel rounded-xl p-5 light-bleed">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant/60 font-bold tracking-wider">Today</p>
                  <p className="text-2xl font-bold text-on-surface">{stats.downloadsToday}</p>
                </div>
              </div>
            </div>
            <div className="glass-panel rounded-xl p-5 light-bleed">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant/60 font-bold tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-on-surface">{stats.totalDownloads}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4 fade-in-stagger delay-300">
            <div className="glass-panel rounded-xl p-5 light-bleed">
              <h2 className="text-sm font-bold text-on-surface tracking-wider mb-3 uppercase">Formats</h2>
              {stats.popularFormats.length === 0 ? (
                <p className="text-xs text-on-surface-variant/60">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.popularFormats.map((f) => (
                    <div key={f.format} className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant uppercase font-bold">{f.format}</span>
                      <span className="text-xs font-bold text-on-surface">{f.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="glass-panel rounded-xl p-5 light-bleed">
              <h2 className="text-sm font-bold text-on-surface tracking-wider mb-3 uppercase">Server</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant/60">Uptime</span>
                  <span className="font-semibold text-on-surface">{Math.floor(stats.serverStatus.uptime / 3600)}h</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant/60">Memory</span>
                  <span className="font-semibold text-on-surface">{stats.serverStatus.memoryUsage}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant/60">Cache</span>
                  <span className="font-semibold text-on-surface">{stats.cache.keys} keys</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 light-bleed mt-4 fade-in-stagger delay-400">
            <h2 className="text-sm font-bold text-on-surface tracking-wider mb-3 uppercase">Activity</h2>
            {logs.length === 0 ? (
              <p className="text-xs text-on-surface-variant/60">No activity yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0">
                    <div>
                      <span className="text-xs font-semibold text-on-surface">{log.action}</span>
                      {log.details && <span className="text-xs text-on-surface-variant/60 ml-2">{log.details}</span>}
                    </div>
                    <span className="text-[10px] text-on-surface-variant/40">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
