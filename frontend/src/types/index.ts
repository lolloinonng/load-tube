export interface VideoMetadata {
  title: string;
  duration: string;
  thumbnail: string;
  author: string;
  formats: QualityOption[];
}

export interface QualityOption {
  itag: number;
  quality: string;
  container: string;
  contentLength?: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: VideoMetadata;
  error?: string;
}

export interface DownloadResponse {
  success: boolean;
  data?: {
    jobId: string;
    title: string;
    format: string;
    fileSize: number;
    downloadUrl: string;
  };
  error?: string;
}

export interface DownloadStatus {
  id: string;
  title: string;
  format: string;
  quality: string;
  status: string;
  fileSize?: number;
}

export interface AdminStats {
  downloadsToday: number;
  totalDownloads: number;
  popularFormats: { format: string; count: number }[];
  serverStatus: {
    uptime: number;
    memoryUsage: string;
  };
  cache: {
    keys: number;
  };
}

export interface AdminLog {
  id: string;
  action: string;
  details?: string;
  ip?: string;
  createdAt: string;
}
