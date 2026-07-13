'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const CATEGORIES = {
  video: { label: 'Video', formats: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv', 'gif'] },
  audio: { label: 'Audio', formats: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'] },
  image: { label: 'Image', formats: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'tiff', 'bmp', 'gif', 'ico'] },
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

export default function ConvertPage() {
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
    const btn = tabRefs.current[targetCat];
    const container = tabContainerRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({ left: btnRect.left - containerRect.left, width: btnRect.width });
    }
  }, [targetCat, compatibleCats]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setTargetFormat('');

    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    const cat = detectCategory(ext);
    setSourceCat(cat);
    if (cat) {
      setTargetCat(COMPATIBLE[cat][0]);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleConvert = async () => {
    if (!file || !targetFormat) return;
    setConverting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', targetFormat);
      const res = await fetch('/api/convert', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Conversion failed');
      setResult(data.data);
      toast.success('Conversion complete!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed');
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
    <div className="flex-grow flex flex-col items-center px-6 w-full max-w-[720px] mx-auto gap-8 py-8">
      <div className="w-full text-center fade-in-stagger delay-100">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-on-surface leading-tight tracking-tight">
          File Converter
        </h1>
        <p className="text-lg text-on-surface-variant mt-3">
          Convert video, audio, images, and documents
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`w-full glass-panel rounded-xl p-10 light-bleed text-center cursor-pointer spring-transition ${
          dragging ? 'border-2 border-primary-container scale-[1.02]' : ''
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <span className="material-symbols-outlined text-primary hand-drawn-icon" style={{ fontSize: '40px' }}>
          cloud_upload
        </span>
        <p className="text-on-surface font-semibold mt-3">
          {file ? file.name : 'Drop a file here or click to browse'}
        </p>
        {file && (
          <p className="text-sm text-on-surface-variant mt-1">{formatSize(file.size)}</p>
        )}
      </div>

      {file && !sourceCat && (
        <div className="w-full glass-panel rounded-xl p-4 border border-red-200/50">
          <p className="text-sm font-medium text-on-surface">Unsupported file format. Please upload a video, audio, image, or PDF.</p>
        </div>
      )}

      {file && sourceCat && (
        <div className="w-full space-y-5 fade-in-stagger">
          <div ref={tabContainerRef} className="relative bg-surface-container-highest rounded-full p-1 w-max flex">
            <div
              className="absolute top-1 bottom-1 rounded-full bg-primary-container shadow-sm"
              style={{ left: pillStyle.left, width: pillStyle.width, transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            {compatibleCats.map((cat) => (
              <button
                key={cat}
                ref={(el) => { tabRefs.current[cat] = el; }}
                onClick={() => { setTargetCat(cat); setTargetFormat(''); }}
                className={`relative z-10 px-5 py-1.5 rounded-full font-bold text-[11px] tracking-wider spring-transition ${
                  targetCat === cat
                    ? 'text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {(CATEGORIES[cat] as { label: string }).label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {availableFormats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTargetFormat(fmt)}
                className={`py-2.5 rounded-lg font-bold text-[11px] tracking-wider spring-transition ${
                  targetFormat === fmt
                    ? 'border-2 border-primary-container bg-primary-fixed/20 text-on-surface shadow-sm'
                    : 'border border-outline-variant text-on-surface-variant hover:border-primary-container hover:bg-primary-fixed/10'
                }`}
              >
                .{fmt}
              </button>
            ))}
          </div>

          <button
            onClick={handleConvert}
            disabled={!targetFormat || converting}
            className="bg-gradient-to-r from-primary-container to-[#8BB8D4] text-on-primary-container font-semibold text-sm px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg flex items-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '18px' }}>
              {converting ? 'sync' : 'swap_horiz'}
            </span>
            {converting ? 'Converting...' : `Convert to .${targetFormat || '...'}`}
          </button>
        </div>
      )}

      {result && (
        <div className="w-full glass-panel rounded-xl p-6 light-bleed fade-in-stagger text-center space-y-3">
          <span className="material-symbols-outlined text-primary hand-drawn-icon" style={{ fontSize: '32px' }}>
            check_circle
          </span>
          <p className="text-on-surface font-semibold">{result.fileName}</p>
          <p className="text-sm text-on-surface-variant">{formatSize(result.fileSize)}</p>
          <a
            href={result.downloadUrl}
            download
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-container to-[#8BB8D4] text-on-primary-container font-semibold text-sm px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg"
          >
            <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '18px' }}>
              download
            </span>
            Download
          </a>
        </div>
      )}
    </div>
  );
}
