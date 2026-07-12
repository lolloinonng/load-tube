'use client';

import { useState, useRef, useEffect } from 'react';
import { UrlInput } from '@/components/features/UrlInput';
import { VideoInfo } from '@/components/features/VideoInfo';
import { FormatSelector } from '@/components/features/FormatSelector';
import { DownloadProgress } from '@/components/features/DownloadProgress';
import { useMediaFetch } from '@/hooks/useMediaFetch';
import { getErrorCodeMessage } from '@/lib/utils';

export default function HomePage() {
  const {
    analyzing,
    downloading,
    metadata,
    downloadStatus,
    error,
    analyze,
    download,
    reset,
  } = useMediaFetch();

  const cardRef = useRef<HTMLDivElement>(null);
  const [parallaxStyle, setParallaxStyle] = useState({});

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -2;
      const rotateY = ((x - centerX) / centerX) * 2;
      setParallaxStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`,
      });
    };

    const handleMouseLeave = () => {
      setParallaxStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [metadata]);

  const handleAnalyze = (url: string) => {
    reset();
    analyze(url);
  };

  const handleDownload = (format: string, quality: string) => {
    if (metadata) {
      download(
        `https://www.youtube.com/watch?v=${metadata.videoId}`,
        format,
        quality
      );
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-6 w-full max-w-[720px] mx-auto gap-12 py-8">
      <div className="w-full text-center mb-4 fade-in-stagger delay-100">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-on-surface leading-tight tracking-tight">
          Download YouTube Media
        </h1>
        <p className="text-lg text-on-surface-variant max-w-lg mx-auto mt-3">
          Inserisci il tuo link di YouTube
        </p>
      </div>

      <div className="w-full fade-in-stagger delay-200 mb-4">
        <UrlInput onSubmit={handleAnalyze} loading={analyzing} />
      </div>

      {analyzing && (
        <div className="w-full flex flex-col items-center justify-center fade-in-stagger delay-300 my-8">
          <div className="w-16 h-16">
            <svg fill="none" stroke="#4a6171" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zM12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8z" opacity="0.2" />
              <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.5.55 2.87 1.46 3.92" strokeDasharray="2 2">
                <animateTransform attributeName="transform" dur="2s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate" />
              </path>
              <circle cx="12" cy="12" r="3" strokeWidth="1">
                <animate attributeName="r" dur="1.5s" repeatCount="indefinite" values="3;4;3" />
              </circle>
            </svg>
          </div>
          <p className="mt-4 font-bold text-xs text-on-surface-variant tracking-[0.2em]">PROCESSING</p>
        </div>
      )}

      {error && (
        <div className="w-full fade-in-stagger delay-300">
          <div className="glass-panel rounded-xl p-4 border border-red-200/50">
            <p className="text-sm font-medium text-on-surface">{error}</p>
          </div>
        </div>
      )}

      {metadata && !analyzing && (
        <div className="w-full space-y-6 fade-in-stagger delay-300">
          <div ref={cardRef} style={parallaxStyle} className="spring-transition">
            <VideoInfo metadata={metadata} />
          </div>
          <div className="fade-in-stagger delay-400">
            <FormatSelector
              metadata={metadata}
              onDownload={handleDownload}
              downloading={downloading}
            />
          </div>
        </div>
      )}

      {downloadStatus && (
        <div className="w-full fade-in-stagger delay-500">
          <DownloadProgress status={downloadStatus} />
        </div>
      )}
    </div>
  );
}
