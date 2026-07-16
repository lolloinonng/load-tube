import { useState, useRef, useCallback } from 'react';
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
  const currentUrlRef = useRef('');

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
    if (!url) return;
    setDownloading(true);
    setError(null);

    try {
      const formatObj = metadata?.formats.find(f => f.quality === quality);
      const itag = formatObj?.itag || quality;
      const res = await window.electronAPI.downloadVideo(url, itag);
      if (res.success) {
        toast.success('Download completato!');
      } else {
        if (res.error !== 'Salvataggio annullato') {
          setError(res.error || 'Download fallito');
        }
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
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <a className="font-bold text-white tracking-tight shrink-0" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }} href="/">load.tube</a>
          <div className="flex items-center bg-[#121212] rounded-full p-0.5">
            <button
              onClick={() => { setTab('download'); setMetadata(null); setError(null); }}
              className={`relative z-10 flex h-9 w-24 items-center justify-center rounded-full text-xs font-bold tracking-wider spring-transition ${tab === 'download' ? 'text-[#1b1c1d]' : 'text-gray-400 hover:text-white'}`}
              style={tab === 'download' ? { background: 'linear-gradient(to right, #DDD6FE, #8B5CF6)' } : {}}
            >
              Download
            </button>
            <button
              onClick={() => { setTab('convert'); setMetadata(null); setError(null); }}
              className={`relative z-10 flex h-9 w-24 items-center justify-center rounded-full text-xs font-bold tracking-wider spring-transition ${tab === 'convert' ? 'text-[#1b1c1d]' : 'text-gray-400 hover:text-white'}`}
              style={tab === 'convert' ? { background: 'linear-gradient(to right, #DDD6FE, #8B5CF6)' } : {}}
            >
              Converti
            </button>
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
                  Seleziona un file e scegli il formato di output. La conversione avviene localmente sul tuo PC.
                </p>
                <div className="mt-8">
                  <ConvertPanel />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-8 bg-transparent max-w-4xl mx-auto flex flex-col items-center gap-4 px-6 z-40 relative">
        <div className="font-bold text-xl text-primary tracking-tight">load.tube</div>
        <div className="font-label-caps text-xs text-on-surface-variant/50 mt-2">
          load.tube Desktop — Tutto in locale, niente server
        </div>
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
