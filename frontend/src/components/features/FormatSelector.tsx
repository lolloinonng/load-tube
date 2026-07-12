'use client';

import { useState } from 'react';
import type { VideoMetadata, VideoQuality, AudioQuality } from '@/types';

interface FormatSelectorProps {
  metadata: VideoMetadata;
  onDownload: (format: string, quality: string) => void;
  downloading: boolean;
}

type TabType = 'video' | 'audio';

export function FormatSelector({ metadata, onDownload, downloading }: FormatSelectorProps) {
  const [tab, setTab] = useState<TabType>('video');
  const [selectedQuality, setSelectedQuality] = useState<string>('');

  const videoQualities: VideoQuality[] = ['360p', '480p', '720p', '1080p'];
  const audioQualities: AudioQuality[] = ['64', '128', '192', '320'];

  const hasQuality = (quality: string) => {
    return metadata.availableQualities.some((q) => q.quality.includes(quality.replace('p', '')));
  };

  const handleDownload = () => {
    if (selectedQuality) {
      const format = tab === 'video' ? 'mp4' : 'mp3';
      onDownload(format, selectedQuality);
    }
  };

  return (
    <div className="w-full glass-panel rounded-xl p-6 light-bleed space-y-5">
      <div className="flex bg-surface-container-highest rounded-full p-1 w-max">
        <button
          onClick={() => { setTab('video'); setSelectedQuality(''); }}
          className={`px-5 py-1.5 rounded-full font-bold text-[11px] tracking-wider spring-transition ${
            tab === 'video'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          Video MP4
        </button>
        <button
          onClick={() => { setTab('audio'); setSelectedQuality(''); }}
          className={`px-5 py-1.5 rounded-full font-bold text-[11px] tracking-wider spring-transition ${
            tab === 'audio'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          Audio MP3
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 max-w-[240px]">
        {(tab === 'video' ? videoQualities : audioQualities).map((quality) => {
          const isAvailable = tab === 'audio' || hasQuality(quality);
          const label = tab === 'video' ? quality : `${quality} kbps`;

          return (
            <button
              key={quality}
              onClick={() => isAvailable && setSelectedQuality(quality)}
              disabled={!isAvailable}
              className={`py-2.5 rounded-lg font-bold text-[11px] tracking-wider spring-transition ${
                selectedQuality === quality
                  ? 'border-2 border-primary-container bg-primary-fixed/20 text-on-surface shadow-sm'
                  : isAvailable
                    ? 'border border-outline-variant text-on-surface-variant hover:border-primary-container hover:bg-primary-fixed/10'
                    : 'border border-outline-variant/30 text-on-surface-variant/30 cursor-not-allowed'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleDownload}
        disabled={!selectedQuality || downloading}
        className="bg-gradient-to-r from-primary-container to-[#8BB8D4] text-on-primary-container font-semibold text-sm px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        {downloading ? (
          <>
            <span className="material-symbols-outlined hand-drawn-icon animate-spin" style={{ fontSize: '18px' }}>
              sync
            </span>
            Downloading...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '18px' }}>
              download
            </span>
            Download {tab === 'video' ? 'Video' : 'Audio'}
          </>
        )}
      </button>
    </div>
  );
}
