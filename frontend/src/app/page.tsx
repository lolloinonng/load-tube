'use client';

import { useState, useRef, useEffect } from 'react';
import { UrlInput } from '@/components/features/UrlInput';
import { VideoInfo } from '@/components/features/VideoInfo';
import { FormatSelector } from '@/components/features/FormatSelector';
import { DownloadProgress } from '@/components/features/DownloadProgress';
import { useMediaFetch } from '@/hooks/useMediaFetch';
import { getErrorCodeMessage } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

export default function HomePage() {
  const { isAuthenticated, loading: authLoading, email } = useAuth();
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
    <div className="flex-grow w-full">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="lg:grid lg:grid-cols-5 lg:gap-12 items-center">
          <div className="lg:col-span-2 fade-in-stagger delay-100">
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-on-surface leading-[1.1] tracking-tight">
              Scarica video da YouTube
            </h1>
            <p className="text-sm text-on-surface-variant mt-3 leading-relaxed max-w-sm">
              Incolla un link YouTube e scegli qualità e formato per il download.
            </p>
          </div>
          <div className="lg:col-span-3 mt-8 lg:mt-0 fade-in-stagger delay-200">
            {!isAuthenticated && !authLoading ? (
              <div className="glass-panel-premium rounded-2xl p-8 light-bleed text-center fade-in-stagger delay-200">
                <GoogleOneTap />
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-lg font-bold text-on-surface">Account Google rilevato</h2>
                <p className="text-sm text-on-surface-variant mt-2">
                  Clicca il profilo qui sopra per accedere
                </p>
                <p className="text-xs text-on-surface-variant/50 mt-4">
                  Non vedi il profilo? <a href="/login" className="text-primary underline">clicca qui</a>
                </p>
              </div>
            ) : (
              <>
            <UrlInput onSubmit={handleAnalyze} loading={analyzing} />

            <div className="mt-6 space-y-5">
              {analyzing && (
                <div className="flex flex-col items-center justify-center fade-in-stagger delay-200 py-8">
                  <div className="w-16 h-16">
                    <svg fill="none" stroke="#8B5CF6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zM12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8z" opacity="0.2" />
                      <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.5.55 2.87 1.46 3.92" strokeDasharray="2 2">
                        <animateTransform attributeName="transform" dur="2s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate" />
                      </path>
                      <circle cx="12" cy="12" r="3" strokeWidth="1">
                        <animate attributeName="r" dur="1.5s" repeatCount="indefinite" values="3;4;3" />
                      </circle>
                    </svg>
                  </div>
                  <p className="mt-4 font-bold text-xs text-on-surface-variant tracking-[0.2em]">ELABORAZIONE</p>
                </div>
              )}

              {error && (
                <div className="glass-panel-premium rounded-2xl p-5 border border-red-200/50">
                  <p className="text-sm font-medium text-on-surface">{error}</p>
                </div>
              )}

              {metadata && !analyzing && (
                <div className="space-y-5 fade-in-stagger delay-200">
                  <div ref={cardRef} style={parallaxStyle} className="spring-transition">
                    <VideoInfo metadata={metadata} />
                  </div>
                  <div className="fade-in-stagger delay-300">
                    <FormatSelector
                      metadata={metadata}
                      onDownload={handleDownload}
                      downloading={downloading}
                    />
                  </div>
                </div>
              )}

              {downloadStatus && (
                <div className="fade-in-stagger delay-300">
                  <DownloadProgress status={downloadStatus} />
                </div>
              )}
            </div>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
