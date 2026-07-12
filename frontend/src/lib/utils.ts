import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
    /^https?:\/\/youtu\.be\/[\w-]{11}/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]{11}/,
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/[\w-]{11}/,
  ];
  return patterns.some((pattern) => pattern.test(url.trim()));
}

export function getErrorCodeMessage(code?: string): string {
  const messages: Record<string, string> = {
    INVALID_URL: 'Please enter a valid YouTube URL',
    PRIVATE_VIDEO: 'This video is private',
    AGE_RESTRICTED: 'This video is age-restricted',
    UNAVAILABLE: 'This video is no longer available',
    LIVE_STREAM: 'Live streams are not supported',
    NETWORK_TIMEOUT: 'Request timed out. Please try again',
    CONVERSION_FAILURE: 'Failed to convert media format',
    RATE_LIMITED: 'Too many requests. Please wait',
    INTERNAL_ERROR: 'Something went wrong. Please try again',
  };
  return messages[code || ''] || 'An unexpected error occurred';
}
