'use client';

import Image from 'next/image';
import type { VideoMetadata } from '@/types';
import { formatDuration, formatDate } from '@/lib/utils';

interface VideoInfoProps {
  metadata: VideoMetadata;
}

export function VideoInfo({ metadata }: VideoInfoProps) {
  return (
    <div className="w-full glass-panel rounded-xl p-6 light-bleed">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden shadow-md relative bg-surface-container-highest">
          <Image
            src={metadata.thumbnail}
            alt={metadata.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 240px"
          />
          <div className="absolute bottom-2 right-2 bg-inverse-surface/80 text-inverse-on-surface text-[11px] font-bold px-2 py-1 rounded backdrop-blur-md tracking-wider">
            {formatDuration(metadata.duration)}
          </div>
        </div>
        <div className="w-full md:w-2/3 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-1 truncate">
              {metadata.title}
            </h2>
            <p className="text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '14px' }}>
                person
              </span>
              {metadata.channel}
            </p>
            <div className="flex gap-3 mt-3">
              <span className="text-xs text-on-surface-variant/60 flex items-center gap-1">
                <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '12px' }}>
                  calendar_today
                </span>
                {formatDate(metadata.uploadDate)}
              </span>
              <span className="text-xs text-on-surface-variant/60 flex items-center gap-1">
                <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '12px' }}>
                  quality
                </span>
                {metadata.availableQualities.length} formats
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
