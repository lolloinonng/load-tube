'use client';

import type { DownloadStatus } from '@/types';

interface DownloadProgressProps {
  status: DownloadStatus;
}

export function DownloadProgress({ status }: DownloadProgressProps) {
  return (
    <div className="w-full glass-panel-premium rounded-2xl p-6 light-bleed">
      <div className="flex items-center gap-3 mb-3">
        <span className="material-symbols-outlined text-sm hand-drawn-icon text-green-500">
          check_circle
        </span>
        <span className="font-bold text-[11px] tracking-wider text-on-surface-variant">
          Download avviato!
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-on-surface-variant/60">
        <span className="uppercase tracking-wider font-bold">{status.format}</span>
        <span>{status.quality}</span>
        {status.title && <span className="truncate">{status.title}</span>}
      </div>
    </div>
  );
}
