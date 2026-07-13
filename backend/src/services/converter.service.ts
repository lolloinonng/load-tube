import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';
import { CONVERT_CATEGORIES, COMPATIBLE_TARGETS, type ConvertCategory } from '../types';

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

function getCategory(format: string): ConvertCategory | null {
  for (const [cat, info] of Object.entries(CONVERT_CATEGORIES)) {
    const f = info as { formats: readonly string[] };
    if (f.formats.includes(format)) return cat as ConvertCategory;
  }
  return null;
}

function isCompatible(sourceFormat: string, targetFormat: string): boolean {
  const srcCat = getCategory(sourceFormat);
  const tgtCat = getCategory(targetFormat);
  if (!srcCat || !tgtCat) return false;
  return (COMPATIBLE_TARGETS[srcCat] as readonly ConvertCategory[]).includes(tgtCat);
}

export class ConverterService {
  async convert(inputPath: string, originalName: string, targetFormat: string): Promise<{ outputPath: string; fileName: string; fileSize: number }> {
    const sourceExt = path.extname(originalName).toLowerCase().replace('.', '') || 'unknown';

    if (!isCompatible(sourceExt, targetFormat)) {
      const srcCat = getCategory(sourceExt);
      const tgtCat = getCategory(targetFormat);
      throw new Error(
        `Cannot convert ${sourceExt.toUpperCase()} (${srcCat || 'unknown'}) to ${targetFormat.toUpperCase()} (${tgtCat || 'unknown'})`
      );
    }

    await fs.mkdir(config.tempDir, { recursive: true });
    const jobId = uuidv4();
    const baseName = path.basename(originalName, path.extname(originalName));
    const outputName = `${baseName}_${jobId}.${targetFormat}`;
    const outputPath = path.join(config.tempDir, outputName);

    try {
      const srcCat = getCategory(sourceExt);
      const tgtCat = getCategory(targetFormat);

      if (tgtCat === 'image') {
        await this.convertToImage(inputPath, outputPath, sourceExt, targetFormat);
      } else if (tgtCat === 'document') {
        await this.convertToDocument(inputPath, outputPath, sourceExt, targetFormat);
      } else if (srcCat === 'video' && tgtCat === 'audio') {
        await this.extractAudio(inputPath, outputPath, targetFormat);
      } else {
        await this.convertFFmpeg(inputPath, outputPath, targetFormat, tgtCat!);
      }

      const stats = await fs.stat(outputPath);
      return { outputPath, fileName: outputName, fileSize: stats.size };
    } catch (err) {
      await fs.unlink(outputPath).catch(() => {});
      throw err;
    }
  }

  private async convertToImage(inputPath: string, outputPath: string, sourceExt: string, targetFormat: string): Promise<void> {
    if (targetFormat === 'ico') {
      const pngBuf = await sharp(inputPath).resize(256, 256).png().toBuffer();
      const icoBuf = await pngToIco(pngBuf);
      await fs.writeFile(outputPath, icoBuf);
    } else if (sourceExt === 'pdf') {
      const images = await pdfToImages(inputPath);
      if (images.length === 0) throw new Error('No pages found in PDF');
      await images[0].toFormat(targetFormat as 'png' | 'jpeg' | 'webp').toFile(outputPath);
    } else {
      const fmt = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
      await (sharp(inputPath) as any).toFormat(fmt).toFile(outputPath);
    }
  }

  private async convertToDocument(inputPath: string, outputPath: string, sourceExt: string, targetFormat: string): Promise<void> {
    if (targetFormat === 'pdf') {
      await sharp(inputPath).toFormat('pdf').toFile(outputPath);
    } else {
      throw new Error(`Unsupported document format: ${targetFormat}`);
    }
  }

  private async extractAudio(inputPath: string, outputPath: string, targetFormat: string): Promise<void> {
    const ffmpegPath = findFfmpeg();
    if (!ffmpegPath) throw new Error('ffmpeg not found');

    const codecMap: Record<string, string> = {
      mp3: 'libmp3lame', wav: 'pcm_s16le', flac: 'flac',
      aac: 'aac', ogg: 'libvorbis', m4a: 'aac',
      wma: 'wmav2', opus: 'libopus',
    };
    const codec = codecMap[targetFormat] || 'copy';

    const args = ['-i', inputPath, '-vn', '-c:a', codec, '-y', outputPath];
    await runFFmpeg(ffmpegPath, args);
  }

  private async convertFFmpeg(inputPath: string, outputPath: string, targetFormat: string, _category: string): Promise<void> {
    const ffmpegPath = findFfmpeg();
    if (!ffmpegPath) throw new Error('ffmpeg not found');

    const args: string[] = ['-i', inputPath];

    if (targetFormat === 'gif') {
      args.push('-vf', 'fps=10,scale=320:-1:flags=lanczos', '-c:v', 'gif');
    } else {
      args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '22');
      const codecMap: Record<string, string> = {
        avi: 'mpeg4', mov: 'libx264', webm: 'libvpx',
        wmv: 'wmv2', flv: 'flv', mkv: 'libx264',
      };
      if (codecMap[targetFormat]) args[args.length - 1] = codecMap[targetFormat];
      if (targetFormat === 'webm') args.push('-c:a', 'libvorbis');
      else args.push('-c:a', 'aac');
    }
    args.push('-y', outputPath);
    await runFFmpeg(ffmpegPath, args);
  }
}

function runFFmpeg(ffmpegPath: string, args: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cp = execFile(ffmpegPath, args, { maxBuffer: 1024 * 1024 * 200 });
    cp.stderr?.on('data', () => {});
    cp.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
    cp.on('error', reject);
  });
}

async function pdfToImages(pdfPath: string): Promise<any[]> {
  const pages: any[] = [];
  let page = 0;
  while (true) {
    try {
      const buf = await sharp(pdfPath, { page, pages: 1 }).png().toBuffer();
      pages.push(sharp(buf));
      page++;
    } catch {
      break;
    }
  }
  return pages.length > 0 ? pages : [sharp(pdfPath, { pages: 1 })];
}
