'use client';

import type { DownloadStatus } from '@/types';

interface DownloadProgressProps {
  status: DownloadStatus;
}

export function DownloadProgress({ status }: DownloadProgressProps) {
  const statusLabel: Record<string, string> = {
    pending: 'In coda',
    processing: 'Scaricamento...',
    completed: 'Completato!',
    failed: 'Fallito',
  };

  return (
    <div className="w-full glass-panel-premium rounded-2xl p-6 light-bleed">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-[11px] tracking-wider text-on-surface-variant flex items-center gap-2">
          {status.status === 'processing' && (
            <span className="material-symbols-outlined text-sm animate-spin hand-drawn-icon">
              sync
            </span>
          )}
          {status.status === 'completed' && (
            <span className="material-symbols-outlined text-sm hand-drawn-icon text-green-500">
              check_circle
            </span>
          )}
          {statusLabel[status.status] || status.status}
        </span>
        <span className="font-bold text-[11px] tracking-wider text-on-surface-variant">
          {status.progress}%
        </span>
      </div>
      <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${status.status === 'processing' ? 'animated-gradient-bar' : 'bg-primary-container'}`}
          style={{ width: `${status.progress}%` }}
        />
      </div>
      {status.error && (
        <p className="mt-3 text-xs text-red-400 font-medium">{status.error}</p>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs text-on-surface-variant/60">
        <span className="uppercase tracking-wider font-bold">{status.format}</span>
        <span>{status.quality}</span>
      </div>
    </div>
  );
}
