import { useState, useRef, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { UrlInput } from '@/components/features/UrlInput';
import { VideoInfo } from '@/components/features/VideoInfo';
import { FormatSelector } from '@/components/features/FormatSelector';
import { ConvertPanel } from '@/components/features/ConvertPanel';
import { CursorGlow } from '@/components/effects/CursorGlow';
import type { VideoMetadata } from '@/types';

type Tab = 'download' | 'convert';

export default function App() {
  const [tab, setTab] = useState<Tab>('download');
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLButtonElement>(null);
  const convertRef = useRef<HTMLButtonElement>(null);
  const currentUrlRef = useRef('');

  useEffect(() => {
    const btn = tab === 'download' ? downloadRef.current : convertRef.current;
    const container = containerRef.current;
    if (btn && container) {
      const cr = container.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      setPillStyle({ left: br.left - cr.left, width: br.width });
    }
  }, [tab]);

  const handleAnalyze = useCallback(async (url: string) => {
    setAnalyzing(true);
    setError(null);
    setMetadata(null);
    currentUrlRef.current = url;

    try {
      const res = await window.electronAPI.getVideoInfo(url);
      if (res.success && res.data) {
        setMetadata(res.data);
      } else {
        setError(res.error || 'Analisi fallita');
      }
    } catch (err: any) {
      setError(err.message || 'Errore di connessione');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleDownload = useCallback(async (format: string, quality: string) => {
    const url = currentUrlRef.current;
    if (!url || !metadata) return;
    setDownloading(true);
    setError(null);

    try {
      const itag = metadata.formats.find(f => f.quality === quality)?.itag || quality;
      const res = await window.electronAPI.downloadVideo(url, itag);
      if (res.success) {
        toast.success('Download completato!');
      } else if (res.error !== 'Salvataggio annullato') {
        setError(res.error || 'Download fallito');
      }
    } catch (err: any) {
      setError(err.message || 'Download fallito');
    } finally {
      setDownloading(false);
    }
  }, [metadata]);

  return (
    <div className="min-h-screen flex flex-col">
      <CursorGlow />
      <header className="w-full bg-[#1a1a1a] py-3 px-6 sticky top-0 z-40">
        <div className="relative flex items-center justify-between max-w-[720px] mx-auto">
          <span className="font-bold text-white tracking-tight shrink-0" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>
            load.tube
          </span>
          <div ref={containerRef} className="absolute left-1/2 -translate-x-1/2 flex items-center rounded-full bg-[#121212] p-0.5">
            <div
              className="absolute top-0.5 bottom-0.5 rounded-full bg-[#8B5CF6]"
              style={{ left: pillStyle.left, width: pillStyle.width, transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <button
              ref={downloadRef}
              onClick={() => { setTab('download'); setMetadata(null); setError(null); }}
              className={`relative z-10 flex h-9 w-16 items-center justify-center rounded-full transition ${tab === 'download' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              ref={convertRef}
              onClick={() => { setTab('convert'); setMetadata(null); setError(null); }}
              className={`relative z-10 flex h-9 w-16 items-center justify-center rounded-full transition ${tab === 'convert' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-sm text-gray-400 spring-transition cursor-default">FAQ</span>
            <span className="text-sm text-gray-400 spring-transition cursor-default">Contact</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-2">
        <div className="flex-grow w-full">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            {tab === 'download' && (
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
                        <VideoInfo metadata={metadata} />
                        <div className="fade-in-stagger delay-300">
                          <FormatSelector
                            metadata={metadata}
                            onDownload={handleDownload}
                            downloading={downloading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'convert' && (
              <div className="max-w-2xl mx-auto fade-in-stagger delay-100">
                <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-on-surface leading-[1.1] tracking-tight text-center">
                  Converti file
                </h1>
                <p className="text-sm text-on-surface-variant mt-3 leading-relaxed text-center max-w-md mx-auto">
                  Seleziona un file e scegli il formato di output.
                </p>
                <div className="mt-8">
                  <ConvertPanel />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-8 bg-transparent max-w-[720px] mx-auto flex flex-col items-center gap-4 px-6 z-40 relative">
        <div className="font-bold text-xl text-primary tracking-tight">load.tube</div>
        <div className="flex gap-6">
          <span className="font-label-caps text-xs text-on-surface-variant/70 spring-transition cursor-default">Privacy</span>
          <span className="font-label-caps text-xs text-on-surface-variant/70 spring-transition cursor-default">Terms</span>
          <span className="font-label-caps text-xs text-on-surface-variant/70 spring-transition cursor-default">Support</span>
        </div>
        <div className="font-label-caps text-xs text-on-surface-variant/50 mt-2">&copy; 2026 load.tube. Crafted with care.</div>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 4000,
        }}
      />
    </div>
  );
}
