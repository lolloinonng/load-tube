import type { Request, Response, NextFunction } from 'express';
import { MetadataService } from '../services/metadata.service';

const metadataService = new MetadataService();

export async function analyzeUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url } = req.body;
    const metadata = await metadataService.getMetadata(url.trim());

    res.json({
      success: true,
      data: metadata,
    });
  } catch (err) {
    next(err);
  }
}
