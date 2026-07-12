'use client';

import { useState, useCallback } from 'react';
import { isValidYouTubeUrl } from '@/lib/utils';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (value.trim()) {
      setIsValid(isValidYouTubeUrl(value));
    } else {
      setIsValid(null);
    }
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
      <div className="glass-panel rounded-full h-14 flex items-center px-6 relative light-bleed">
        <span className="material-symbols-outlined text-outline mr-3 hand-drawn-icon" style={{ fontSize: '20px' }}>
          link
        </span>
        <input
          value={url}
          onChange={handleChange}
          placeholder="Drop a YouTube link and we'll work our magic"
          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant outline-none h-full text-sm font-normal"
        />
        {url && isValid === true && (
          <span className="material-symbols-outlined text-primary-container animate-breathe ml-3 hand-drawn-icon" style={{ fontSize: '20px' }}>
            check_circle
          </span>
        )}
        {url && isValid === false && (
          <span className="material-symbols-outlined text-red-400 ml-3 hand-drawn-icon" style={{ fontSize: '20px' }}>
            cancel
          </span>
        )}
      </div>
      {url && isValid === false && (
        <p className="text-xs text-red-400 mt-2 ml-4">Please enter a valid YouTube URL</p>
      )}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={!url || !isValid || loading}
          className="bg-gradient-to-r from-primary-container to-[#8BB8D4] text-on-primary-container font-semibold text-base px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Analyzing...' : 'Analyze Link'}
          <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '20px' }}>
            {loading ? 'sync' : 'auto_awesome'}
          </span>
        </button>
      </div>
    </form>
  );
}
