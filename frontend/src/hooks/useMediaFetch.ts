'use client';

import { useState, useCallback, useRef } from 'react';
import type { VideoMetadata, DownloadStatus } from '@/types';
import { analyzeUrl, startDownload } from '@/lib/api';

interface UseMediaFetchReturn {
  loading: boolean;
  analyzing: boolean;
  downloading: boolean;
  metadata: VideoMetadata | null;
  downloadStatus: DownloadStatus | null;
  error: string | null;
  analyze: (url: string) => Promise<void>;
  download: (format: string, quality: string) => Promise<void>;
  reset: () => void;
}

export function useMediaFetch(): UseMediaFetchReturn {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentUrlRef = useRef<string>('');

  const analyze = useCallback(async (url: string) => {
    setAnalyzing(true);
    setError(null);
    setMetadata(null);
    setDownloadStatus(null);
    currentUrlRef.current = url;

    try {
      const response = await analyzeUrl(url);
      if (response.success && response.data) {
        setMetadata(response.data);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (format: string, quality: string) => {
    const url = currentUrlRef.current;
    if (!url) return;
    setDownloading(true);
    setError(null);

    try {
      const response = await startDownload(url, format, quality);
      if (response.success && response.data) {
        const { jobId, downloadUrl, title } = response.data;
        setDownloadStatus({
          id: jobId,
          title,
          format,
          quality,
          status: 'completed',
          fileSize: response.data.fileSize || 0,
        });

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${title || 'video'}.${format}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setError(response.error || 'Download failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMetadata(null);
    setDownloadStatus(null);
    setError(null);
    setAnalyzing(false);
    setDownloading(false);
    currentUrlRef.current = '';
  }, []);

  return { loading, analyzing, downloading, metadata, downloadStatus, error, analyze, download, reset };
}
