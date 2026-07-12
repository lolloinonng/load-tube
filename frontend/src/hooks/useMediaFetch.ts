'use client';

import { useState, useCallback } from 'react';
import type { VideoMetadata, DownloadStatus } from '@/types';
import { analyzeUrl, startDownload, getDownloadStatus, getDownloadFileUrl } from '@/lib/api';
import { getErrorCodeMessage } from '@/lib/utils';

interface UseMediaFetchReturn {
  loading: boolean;
  analyzing: boolean;
  downloading: boolean;
  metadata: VideoMetadata | null;
  downloadStatus: DownloadStatus | null;
  error: string | null;
  analyze: (url: string) => Promise<void>;
  download: (url: string, format: string, quality: string) => Promise<void>;
  pollStatus: (jobId: string) => Promise<void>;
  reset: () => void;
}

export function useMediaFetch(): UseMediaFetchReturn {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (url: string) => {
    setAnalyzing(true);
    setError(null);
    setMetadata(null);
    setDownloadStatus(null);

    try {
      const response = await analyzeUrl(url);
      if (response.success && response.data) {
        setMetadata(response.data);
      } else {
        setError(getErrorCodeMessage(response.code));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string) => {
    const maxAttempts = 60;
    const interval = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      try {
        const response = await getDownloadStatus(jobId);
        if (response.success && response.data) {
          setDownloadStatus(response.data);

          if (response.data.status === 'completed' || response.data.status === 'failed') {
            if (response.data.status === 'completed' && response.data.fileSize && response.data.fileSize > 0) {
              await new Promise((r) => setTimeout(r, 500));
              const fileUrl = getDownloadFileUrl(jobId);
              const a = document.createElement('a');
              a.href = fileUrl;
              a.download = response.data.fileName || 'download';
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            return;
          }
        }
      } catch {
        // Continue polling
      }
    }

    setError('Download timed out');
  }, []);

  const download = useCallback(async (url: string, format: string, quality: string) => {
    setDownloading(true);
    setError(null);

    try {
      const response = await startDownload(url, format, quality);
      if (response.success && response.data) {
        setDownloadStatus({
          id: response.data.jobId,
          title: '',
          format,
          quality,
          status: 'pending',
          progress: 0,
          createdAt: new Date().toISOString(),
        });
        await pollStatus(response.data.jobId);
      } else {
        setError(getErrorCodeMessage());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }, [pollStatus]);

  const reset = useCallback(() => {
    setMetadata(null);
    setDownloadStatus(null);
    setError(null);
    setAnalyzing(false);
    setDownloading(false);
  }, []);

  return {
    loading,
    analyzing,
    downloading,
    metadata,
    downloadStatus,
    error,
    analyze,
    download,
    pollStatus,
    reset,
  };
}
