export interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  channel: string;
  channelUrl: string;
  uploadDate: Date;
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
  bitrate?: number;
  label: string;
}

export interface AudioFormat {
  itag: number;
  bitrate: number;
  container: string;
  contentLength?: string;
  label: string;
}

export interface DownloadJob {
  id: string;
  url: string;
  title: string;
  format: string;
  quality: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  createdAt: Date;
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
  code?: string;
}

export interface StatusResponse {
  success: boolean;
  data?: DownloadJob;
  error?: string;
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
