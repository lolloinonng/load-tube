export interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  channel: string;
  channelUrl: string;
  uploadDate: string;
  availableQualities: QualityOption[];
}

export interface QualityOption {
  itag: number;
  quality: string;
  container: string;
  fps?: number;
  hasAudio: boolean;
  hasVideo: boolean;
  contentLength?: string;
  label: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: VideoMetadata;
  error?: string;
  code?: string;
}

export interface DownloadResponse {
  success: boolean;
  data?: {
    jobId: string;
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  };
  error?: string;
}

export interface DownloadStatus {
  id: string;
  title: string;
  format: string;
  quality: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileName?: string;
  fileSize?: number;
  error?: string;
  createdAt: string;
}

export interface AdminStats {
  downloadsToday: number;
  totalDownloads: number;
  popularFormats: { format: string; count: number }[];
  serverStatus: {
    uptime: number;
    memoryUsage: string;
    cpuUsage: string;
  };
  cache: {
    keys: number;
    hits: number;
    misses: number;
  };
}

export interface AdminLog {
  id: string;
  action: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

export type ErrorCode =
  | 'INVALID_URL'
  | 'PRIVATE_VIDEO'
  | 'AGE_RESTRICTED'
  | 'UNAVAILABLE'
  | 'LIVE_STREAM'
  | 'NETWORK_TIMEOUT'
  | 'CONVERSION_FAILURE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export type VideoFormat = 'mp4';
export type AudioFormat = 'mp3';
export type VideoQuality = '360p' | '480p' | '720p' | '1080p';
export type AudioQuality = '64' | '128' | '192' | '320';
