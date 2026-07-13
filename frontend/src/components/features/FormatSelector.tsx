'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const btn = tabRefs.current[tab];
    const container = tabContainerRef.current;
    if (btn && container) {
      const cr = container.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      setPillStyle({ left: br.left - cr.left, width: br.width });
    }
  }, [tab]);

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
    <div className="w-full glass-panel-premium rounded-2xl p-6 light-bleed space-y-5">
      <div ref={tabContainerRef} className="relative bg-surface-container-highest rounded-full p-1 w-max flex">
        <div
          className="absolute top-1 bottom-1 rounded-full bg-primary-container shadow-sm"
          style={{ left: pillStyle.left, width: pillStyle.width, transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <button
          ref={(el) => { tabRefs.current['video'] = el; }}
          onClick={() => { setTab('video'); setSelectedQuality(''); }}
          className={`relative z-10 px-5 py-1.5 rounded-full font-bold text-[11px] tracking-wider spring-transition ${
            tab === 'video'
              ? 'text-on-primary-container'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Video MP4
        </button>
        <button
          ref={(el) => { tabRefs.current['audio'] = el; }}
          onClick={() => { setTab('audio'); setSelectedQuality(''); }}
          className={`relative z-10 px-5 py-1.5 rounded-full font-bold text-[11px] tracking-wider spring-transition ${
            tab === 'audio'
              ? 'text-on-primary-container'
              : 'text-on-surface-variant hover:text-on-surface'
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
        className="bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-semibold text-sm px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        {downloading ? (
          <>
            <span className="material-symbols-outlined hand-drawn-icon animate-spin" style={{ fontSize: '18px' }}>
              sync
            </span>
            Scaricamento...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '18px' }}>
              download
            </span>
            {tab === 'video' ? 'Scarica Video' : 'Scarica Audio'}
          </>
        )}
      </button>
    </div>
  );
}
