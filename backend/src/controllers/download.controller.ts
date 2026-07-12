import type { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import { MetadataService } from '../services/metadata.service';
import { DownloadService } from '../services/download.service';

const metadataService = new MetadataService();
const downloadService = new DownloadService();

export async function startDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url, format, quality } = req.body;
    const metadata = await metadataService.getMetadata(url.trim());
    const job = await downloadService.createDownload(url.trim(), format, quality, metadata.title);

    res.json({
      success: true,
      data: {
        jobId: job.id,
        fileName: job.fileName,
        fileSize: job.fileSize || 0,
        status: job.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDownloadStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const job = downloadService.getJob(id);

    if (!job) {
      res.status(404).json({ success: false, error: 'Download job not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        format: job.format,
        quality: job.quality,
        status: job.status,
        progress: job.progress,
        fileName: job.fileName,
        fileSize: job.fileSize,
        error: job.error,
        createdAt: job.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDownloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const job = downloadService.getJob(id);

    if (!job || job.status !== 'completed' || !job.filePath) {
      res.status(404).json({ success: false, error: 'Download not ready or not found' });
      return;
    }

    const exists = await fs.stat(job.filePath).then(() => true).catch(() => false);
    if (!exists) {
      res.status(404).json({ success: false, error: 'File not found on disk' });
      return;
    }

    const fileName = job.fileName || 'download';
    res.download(job.filePath, fileName, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
}
