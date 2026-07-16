import { useState, useCallback } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

const YT_PATTERNS = [
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
  /^https?:\/\/youtu\.be\/[\w-]{11}/,
  /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]{11}/,
  /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/[\w-]{11}/,
];

function isValidYouTubeUrl(url: string): boolean {
  return YT_PATTERNS.some((p) => p.test(url.trim()));
}

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setIsValid(value.trim() ? isValidYouTubeUrl(value) : null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (url.trim() && isValidYouTubeUrl(url)) {
        onSubmit(url.trim());
      }
    },
    [url, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-panel-premium rounded-2xl h-16 flex items-center px-6 relative light-bleed">
        <span className="material-symbols-outlined text-outline mr-3 hand-drawn-icon" style={{ fontSize: '22px' }}>
          link
        </span>
        <input
          value={url}
          onChange={handleChange}
          placeholder="Incolla un link YouTube"
          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant outline-none h-full text-sm font-normal"
        />
        {url && isValid === true && (
          <span className="material-symbols-outlined text-primary animate-breathe ml-3 hand-drawn-icon" style={{ fontSize: '22px' }}>
            check_circle
          </span>
        )}
        {url && isValid === false && (
          <span className="material-symbols-outlined text-red-400 ml-3 hand-drawn-icon" style={{ fontSize: '22px' }}>
            cancel
          </span>
        )}
      </div>
      {url && isValid === false && (
        <p className="text-xs text-red-400 mt-2 ml-4">Inserisci un URL YouTube valido</p>
      )}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={!url || !isValid || loading}
          className="bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-semibold text-base px-10 py-3.5 rounded-full liquid-hover spring-transition shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Analisi in corso...' : 'Analizza Link'}
          <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '20px' }}>
            {loading ? 'sync' : 'auto_awesome'}
          </span>
        </button>
      </div>
    </form>
  );
}
