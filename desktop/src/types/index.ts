export interface VideoMetadata {
  title: string;
  duration: number;
  thumbnail: string;
  author: string;
  formats: QualityOption[];
}

export interface QualityOption {
  itag: string;
  quality: string;
  container: string;
  contentLength?: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface ElectronAPI {
  getVideoInfo: (url: string) => Promise<{ success: boolean; data?: VideoMetadata; error?: string }>;
  downloadVideo: (url: string, itag: string) => Promise<{ success: boolean; data?: { path: string }; error?: string }>;
  convertFile: (inputPath: string, outputFormat: string) => Promise<{ success: boolean; data?: { path: string }; error?: string }>;
  openFileDialog: () => Promise<{ success: boolean; data?: { path: string }; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
