import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { logger } from './logger';

export async function cleanupTempFiles(maxAge: number = 3600000): Promise<void> {
  try {
    const tempDir = config.tempDir;
    await fs.mkdir(tempDir, { recursive: true });
    const files = await fs.readdir(tempDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      try {
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          logger.debug(`Cleaned up temp file: ${file}`);
        }
      } catch (err) {
        logger.warn(`Failed to clean up ${filePath}`, err);
      }
    }
  } catch (err) {
    logger.error('Failed to clean temp directory', err);
  }
}

export function startCleanupInterval(intervalMs: number = 1800000): NodeJS.Timeout {
  cleanupTempFiles();
  return setInterval(() => cleanupTempFiles(), intervalMs);
}

export async function removeTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.debug(`Removed temp file: ${filePath}`);
  } catch {
    // File may already be deleted
  }
}
