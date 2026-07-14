'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminStats, getAdminLogs, getUsers, createUserApi, deleteUserApi } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import type { AdminStats, AdminLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { Download, BarChart3, Users, Plus, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('site_token') : null;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string; role: string; createdAt: string }[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getUsers(token);
      if (res.success) setUsers(res.data);
    } catch {}
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [statsRes, logsRes] = await Promise.all([
        getAdminStats(token),
        getAdminLogs(token, 50),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success) setLogs(logsRes.data);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/');
      return;
    }
    if (token) { loadData(); loadUsers(); }
  }, [token, authLoading, isAuthenticated, isAdmin, router, loadData, loadUsers]);

  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-grow px-6 py-8 w-full max-w-[720px] mx-auto">
        <div className="flex justify-center py-12">
          <div className="w-12 h-12">
            <svg fill="none" stroke="#8B5CF6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.5.55 2.87 1.46 3.92" strokeDasharray="2 2">
                <animateTransform attributeName="transform" dur="2s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate" />
              </path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow px-6 py-8 w-full max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold text-on-surface tracking-tight mb-8 fade-in-stagger delay-100">Admin</h1>

      <div className="grid gap-4 sm:grid-cols-2 fade-in-stagger delay-200">
        <div className="glass-panel rounded-xl p-5 light-bleed">
          <div className="flex items-center gap-3">
            <Download className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-on-surface-variant/60 font-bold tracking-wider">Oggi</p>
              <p className="text-2xl font-bold text-on-surface">{stats.downloadsToday}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-5 light-bleed">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-on-surface-variant/60 font-bold tracking-wider">Totale</p>
              <p className="text-2xl font-bold text-on-surface">{stats.totalDownloads}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-4 fade-in-stagger delay-300">
        <div className="glass-panel rounded-xl p-5 light-bleed">
          <h2 className="text-sm font-bold text-on-surface tracking-wider mb-3 uppercase">Formati</h2>
          {stats.popularFormats.length === 0 ? (
            <p className="text-xs text-on-surface-variant/60">Nessun dato</p>
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
              <span className="text-on-surface-variant/60">Memoria</span>
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
        <h2 className="text-sm font-bold text-on-surface tracking-wider mb-3 uppercase">Attività</h2>
        {logs.length === 0 ? (
          <p className="text-xs text-on-surface-variant/60">Nessuna attività</p>
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

      <div className="glass-panel rounded-xl p-5 light-bleed mt-4 fade-in-stagger delay-400">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-on-surface tracking-wider uppercase flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Whitelist
          </h2>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="text-xs font-bold text-primary hover:text-primary-container spring-transition flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Aggiungi
          </button>
        </div>

        {showAddUser && (
          <div className="flex gap-2 mb-3">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container spring-transition"
            />
            <button
              onClick={async () => {
                if (!newEmail) return;
                await createUserApi(token!, newEmail);
                setNewEmail('');
                setShowAddUser(false);
                loadUsers();
              }}
              className="bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-bold text-[10px] px-3 py-2 rounded-lg spring-transition"
            >
              Salva
            </button>
          </div>
        )}

        <div className="space-y-1">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate">{u.email}</span>
                <span className="text-[10px] uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-full bg-primary/10 shrink-0">{u.role}</span>
              </div>
              <button
                onClick={async () => {
                  if (confirm(`Rimuovere ${u.email} dalla whitelist?`)) {
                    await deleteUserApi(token!, u.id);
                    loadUsers();
                  }
                }}
                className="text-on-surface-variant/40 hover:text-red-400 spring-transition shrink-0 ml-2"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-xs text-on-surface-variant/60">Nessun utente autorizzato</p>
          )}
        </div>
      </div>
    </div>
  );
}
