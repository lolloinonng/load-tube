import type { Request, Response, NextFunction } from 'express';
import { isValidYouTubeUrl } from '../utils/validation';

export function validateAnalyzeRequest(req: Request, res: Response, next: NextFunction): void {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ success: false, error: 'URL is required', code: 'INVALID_URL' });
    return;
  }

  if (!isValidYouTubeUrl(url.trim())) {
    res.status(400).json({ success: false, error: 'Invalid YouTube URL', code: 'INVALID_URL' });
    return;
  }

  next();
}

export function validateDownloadRequest(req: Request, res: Response, next: NextFunction): void {
  const { url, format, quality } = req.body;

  if (!url || !format || !quality) {
    res.status(400).json({ success: false, error: 'url, format, and quality are required' });
    return;
  }

  if (typeof url !== 'string' || !isValidYouTubeUrl(url.trim())) {
    res.status(400).json({ success: false, error: 'Invalid YouTube URL', code: 'INVALID_URL' });
    return;
  }

  const validFormats = ['mp4', 'mp3'];
  if (!validFormats.includes(format)) {
    res.status(400).json({ success: false, error: 'Format must be mp4 or mp3' });
    return;
  }

  if (format === 'mp4') {
    const validQualities = ['360p', '480p', '720p', '1080p'];
    if (!validQualities.includes(quality)) {
      res.status(400).json({ success: false, error: 'Invalid video quality' });
      return;
    }
  } else {
    const validBitrates = ['64', '128', '192', '320'];
    if (!validBitrates.includes(quality)) {
      res.status(400).json({ success: false, error: 'Invalid audio bitrate' });
      return;
    }
  }

  next();
}
