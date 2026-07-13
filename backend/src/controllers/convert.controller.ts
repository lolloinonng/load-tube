import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { ConverterService } from '../services/converter.service';
import { config } from '../config';
import { removeTempFile } from '../utils/cleanup';

const converterService = new ConverterService();

export async function convertFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    const { targetFormat } = req.body;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    if (!targetFormat || typeof targetFormat !== 'string') {
      res.status(400).json({ success: false, error: 'targetFormat is required' });
      return;
    }

    const result = await converterService.convert(file.path, file.originalname, targetFormat);

    res.json({
      success: true,
      data: {
        fileName: result.fileName,
        fileSize: result.fileSize,
        downloadUrl: `/api/convert/download/${encodeURIComponent(result.fileName)}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadConverted(req: Request, res: Response): Promise<void> {
  const fileName = req.params.fileName as string;
  const filePath = path.join(config.tempDir, fileName);

  res.download(filePath, fileName, (err) => {
    if (!err) {
      setTimeout(() => removeTempFile(filePath), 5000);
    }
  });
}
