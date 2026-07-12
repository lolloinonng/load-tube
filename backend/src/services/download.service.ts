import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import type { DownloadJob } from '../types';
import { logger } from '../utils/logger';
import { sanitizeFilename } from '../utils/validation';
import { removeTempFile } from '../utils/cleanup';


function findFfmpeg(): string | null {
  const candidates = [
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    'ffmpeg',
    'C:\\Users\\loren\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe',
    'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
  ];
  for (const c of candidates) {
    try { require('fs').accessSync(c); return c; } catch { continue; }
  }
  return null;
}
const jobs = new Map<string, DownloadJob>();

export class DownloadService {
  async createDownload(
    url: string,
    format: string,
    quality: string,
    title: string
  ): Promise<DownloadJob> {
    const jobId = uuidv4();
    const safeTitle = sanitizeFilename(title);

    const ext = format === 'mp3' ? 'mp3' : 'mp4';
    const fileName = `${safeTitle}_${quality}.${ext}`;
    const filePath = path.join(config.tempDir, `${jobId}_${fileName}`);

    const job: DownloadJob = {
      id: jobId,
      url,
      title,
      format,
      quality,
      status: 'pending',
      progress: 0,
      fileName,
      filePath,
      createdAt: new Date(),
    };

    jobs.set(jobId, job);
    this.processDownload(job);

    return job;
  }

  private async processDownload(job: DownloadJob): Promise<void> {
    try {
      job.status = 'processing';
      await fs.mkdir(config.tempDir, { recursive: true });

      const formatSpec = job.format === 'mp3'
        ? `ba[abr<=${job.quality}]/ba`
        : `bv[height<=${job.quality.replace('p', '')}]+ba/b[height<=${job.quality.replace('p', '')}]`;

      const outputTemplate = job.filePath!;

      const ffmpegPath = findFfmpeg();
      const args: string[] = [
        job.url,
        '-f', formatSpec,
        '-o', outputTemplate,
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificate',
        '--newline',
      ];

      if (ffmpegPath) {
        args.push('--ffmpeg-location', path.dirname(ffmpegPath));
      }

      if (job.format === 'mp3') {
        args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      } else {
        args.push('--merge-output-format', 'mp4');
      }

      const childProcess = execFile('yt-dlp', args, {
        maxBuffer: 1024 * 1024 * 100,
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        const line = data.toString();
        const progressMatch = line.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
          job.progress = Math.round(parseFloat(progressMatch[1]));
        }
      });

      await new Promise<void>((resolve, reject) => {
        childProcess.on('exit', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`yt-dlp exited with code ${code}`));
        });
        childProcess.on('error', reject);
      });

      const stats = await fs.stat(job.filePath!).catch(() => null);
      if (stats) {
        job.fileSize = stats.size;
      } else {
        const files = await fs.readdir(config.tempDir);
        const match = files.find((f) => f.startsWith(job.id));
        if (match) {
          job.filePath = path.join(config.tempDir, match);
          job.fileName = match.replace(/^[a-f0-9-]+_/, '');
          const stats2 = await fs.stat(job.filePath).catch(() => null);
          if (stats2) job.fileSize = stats2.size;
        }
      }

      job.status = 'completed';
      job.progress = 100;

      logger.info('Download completed', { jobId: job.id, file: job.filePath, size: job.fileSize });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Download processing failed', { jobId: job.id, error: message });
      job.status = 'failed';
      job.error = message;
      if (job.filePath) removeTempFile(job.filePath);
    }
  }

  getJob(jobId: string): DownloadJob | undefined {
    return jobs.get(jobId);
  }
}
