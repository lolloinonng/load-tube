'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const CATEGORIES = {
  video: { label: 'Video', formats: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv', 'gif'] },
  audio: { label: 'Audio', formats: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'] },
  image: { label: 'Image', formats: ['png', 'jpg', 'webp', 'avif', 'gif', 'ico'] },
  document: { label: 'Document', formats: ['pdf'] },
} as const;

type Category = keyof typeof CATEGORIES;

const COMPATIBLE: Record<Category, Category[]> = {
  video: ['video', 'audio'],
  audio: ['audio'],
  image: ['image', 'document'],
  document: ['document', 'image'],
};

function detectCategory(ext: string): Category | null {
  for (const [cat, info] of Object.entries(CATEGORIES)) {
    const formats = (info as { formats: readonly string[] }).formats;
    if (formats.includes(ext)) return cat as Category;
  }
  return null;
}

let ffmpeg: FFmpeg | null = null;
let ffmpegLoading = false;
let ffmpegLoaded = false;

async function getFFmpeg() {
  if (ffmpegLoaded && ffmpeg) return ffmpeg;
  if (ffmpegLoading) {
    while (!ffmpegLoaded) await new Promise((r) => setTimeout(r, 100));
    return ffmpeg!;
  }
  ffmpegLoading = true;
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({ coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'), wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm') });
  ffmpegLoaded = true;
  ffmpegLoading = false;
  return ffmpeg;
}

export default function ConvertPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [sourceCat, setSourceCat] = useState<Category | null>(null);
  const [targetCat, setTargetCat] = useState<Category>('video');
  const [targetFormat, setTargetFormat] = useState('');
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ fileName: string; fileSize: number; downloadUrl: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const compatibleCats: Category[] = sourceCat ? COMPATIBLE[sourceCat] : ['video', 'audio', 'image', 'document'];

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const btn = tabRefs.current[targetCat];
    const container = tabContainerRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({ left: btnRect.left - containerRect.left, width: btnRect.width });
    }
  }, [targetCat, compatibleCats]);

  const handleFile = useCallback((f: File) => {
    setFile(f); setResult(null); setTargetFormat('');
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    const cat = detectCategory(ext);
    setSourceCat(cat);
    if (cat) setTargetCat(COMPATIBLE[cat][0]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleConvert = async () => {
    if (!file || !targetFormat) return;
    setConverting(true); setResult(null);

    try {
      toast.loading('Caricamento FFmpeg...', { id: 'conv' });
      const ff = await getFFmpeg();
      toast.loading('Conversione in corso...', { id: 'conv' });

      const inputName = file.name;
      const outputName = `${file.name.replace(/\.[^.]+$/, '')}.${targetFormat}`;

      await ff.writeFile(inputName, await fetchFile(file));
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (targetFormat === 'ico') {
        await ff.exec(['-i', inputName, '-vf', 'scale=256:256', outputName]);
      } else if (targetFormat === 'gif' && ext !== 'gif') {
        await ff.exec(['-i', inputName, '-vf', 'fps=10,scale=320:-1:flags=lanczos', outputName]);
      } else if (['video', 'audio'].includes(targetCat)) {
        await ff.exec(['-i', inputName, outputName]);
      } else {
        await ff.exec(['-i', inputName, outputName]);
      }

      const raw = await ff.readFile(outputName);
      const arr = raw instanceof Uint8Array ? raw : new Uint8Array(raw as any);
      const blob = new Blob([arr.buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      setResult({ fileName: outputName, fileSize: blob.size, downloadUrl: url });
      toast.success('Conversione completata!', { id: 'conv' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversione fallita', { id: 'conv' });
    }
    setConverting(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const availableFormats = sourceCat
    ? (CATEGORIES[targetCat] as { formats: readonly string[] }).formats.filter((fmt) => fmt !== file?.name.split('.').pop()?.toLowerCase())
    : [];

  return (
    <div className="flex-grow w-full">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="lg:grid lg:grid-cols-5 lg:gap-12 items-start">
          <div className="lg:col-span-2 fade-in-stagger delay-100 lg:sticky lg:top-24">
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-on-surface leading-[1.1] tracking-tight">
              Converti File
            </h1>
            <p className="text-sm text-on-surface-variant mt-3 leading-relaxed max-w-sm">
              Converti video, audio, immagini e documenti in qualsiasi formato.
            </p>
          </div>
          {authLoading || !isAuthenticated ? (
            <div className="lg:col-span-3 flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
          <div className="lg:col-span-3 mt-8 lg:mt-0 fade-in-stagger delay-200">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`w-full glass-panel-premium rounded-2xl p-12 md:p-16 light-bleed text-center cursor-pointer spring-transition ${
                dragging ? 'border-2 border-primary-container scale-[1.02]' : ''
              }`}
            >
              <input ref={inputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-fixed/15 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary hand-drawn-icon" style={{ fontSize: '32px' }}>cloud_upload</span>
              </div>
              <p className="text-on-surface font-semibold text-lg">
                {file ? file.name : 'Trascina un file qui o clicca per cercare'}
              </p>
              {file && <p className="text-sm text-on-surface-variant mt-1">{formatSize(file.size)}</p>}
              {!file && <p className="text-sm text-on-surface-variant/60 mt-2">Supporta video, audio, immagini e PDF</p>}
            </div>

            <div className="mt-6 space-y-5">
              {file && !sourceCat && (
                <div className="glass-panel-premium rounded-2xl p-5 border border-red-200/50">
                  <p className="text-sm font-medium text-on-surface">Formato file non supportato. Carica un video, audio, immagine o PDF.</p>
                </div>
              )}

              {file && sourceCat && (
                <div className="space-y-5 fade-in-stagger">
                  <div ref={tabContainerRef} className="relative bg-surface-container-highest rounded-full p-1 w-max flex">
                    <div className="absolute top-1 bottom-1 rounded-full bg-primary-container shadow-sm" style={{ left: pillStyle.left, width: pillStyle.width, transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    {compatibleCats.map((cat) => (
                      <button key={cat} ref={(el) => { tabRefs.current[cat] = el; }} onClick={() => { setTargetCat(cat); setTargetFormat(''); }}
                        className={`relative z-10 px-5 py-1.5 rounded-full font-bold text-[11px] tracking-wider spring-transition ${targetCat === cat ? 'text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>
                        {(CATEGORIES[cat] as { label: string }).label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {availableFormats.map((fmt) => (
                      <button key={fmt} onClick={() => setTargetFormat(fmt)}
                        className={`py-2.5 rounded-lg font-bold text-[11px] tracking-wider spring-transition ${targetFormat === fmt
                          ? 'border-2 border-primary-container bg-primary-fixed/20 text-on-surface shadow-sm'
                          : 'border border-outline-variant text-on-surface-variant hover:border-primary-container hover:bg-primary-fixed/10'}`}>
                        .{fmt}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <button onClick={handleConvert} disabled={!targetFormat || converting}
                      className="bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-semibold text-sm px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                      <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '18px' }}>
                        {converting ? 'sync' : 'swap_horiz'}
                      </span>
                      {converting ? 'Conversione in corso...' : `Converti in .${targetFormat || '...'}`}
                    </button>
                  </div>
                </div>
              )}

              {result && (
                <div className="glass-panel-premium rounded-2xl p-8 light-bleed fade-in-stagger text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-primary-fixed/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary hand-drawn-icon" style={{ fontSize: '28px' }}>check_circle</span>
                  </div>
                  <p className="text-on-surface font-semibold text-lg">{result.fileName}</p>
                  <p className="text-sm text-on-surface-variant">{formatSize(result.fileSize)}</p>
                  <a href={result.downloadUrl} download
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-semibold text-sm px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg mt-2">
                    <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '18px' }}>download</span>
                    Scarica
                  </a>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
