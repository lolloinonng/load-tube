import ytdl from '@distube/ytdl-core';
import NodeCache from 'node-cache';
import type { VideoMetadata, QualityOption, AudioFormat } from '../types';
import { Errors } from '../utils/errors';
import { logger } from '../utils/logger';
import { extractVideoId } from '../utils/validation';

const cache = new NodeCache({ stdTTL: 600 });

export class MetadataService {
  async getMetadata(url: string): Promise<VideoMetadata> {
    const videoId = extractVideoId(url);
    if (!videoId) throw Errors.invalidUrl();

    const cached = cache.get<VideoMetadata>(videoId);
    if (cached) return cached;

    try {
      const info = await ytdl.getInfo(url, { requestOptions: { headers: { 'Accept-Language': 'en' } } });

      const videoDetails = info.videoDetails;

      if (videoDetails.isPrivate) throw Errors.privateVideo();
      if (videoDetails.isLiveContent) throw Errors.liveStream();
      if (videoDetails.isUnlisted && !videoDetails.isPrivate) {
        // Unlisted is fine
      }

      const formats = info.formats;

      const videoFormats = formats
        .filter((f) => f.hasVideo && f.hasAudio && f.qualityLabel)
        .map((f) => ({
          itag: f.itag,
          quality: f.qualityLabel || 'unknown',
          container: f.container || 'mp4',
          fps: f.fps,
          hasAudio: f.hasAudio,
          hasVideo: f.hasVideo,
          contentLength: f.contentLength,
          label: `${f.qualityLabel} - ${f.container}`,
        }));

      const seenQualities = new Set<string>();
      const uniqueQualities: QualityOption[] = [];
      for (const q of videoFormats) {
        const key = q.quality;
        if (!seenQualities.has(key)) {
          seenQualities.add(key);
          uniqueQualities.push(q);
        }
      }

      const audioFormats: AudioFormat[] = formats
        .filter((f) => f.hasAudio && !f.hasVideo && f.audioBitrate)
        .map((f) => ({
          itag: f.itag,
          bitrate: f.audioBitrate || 128,
          container: f.container || 'webm',
          contentLength: f.contentLength,
          label: `${f.audioBitrate} kbps - ${f.container}`,
        }));

      const uniqueAudio = audioFormats.filter(
        (f, i, arr) => arr.findIndex((a) => a.bitrate === f.bitrate) === i
      );

      const metadata: VideoMetadata = {
        videoId: videoDetails.videoId,
        title: videoDetails.title,
        description: videoDetails.description?.substring(0, 500) || '',
        duration: parseInt(videoDetails.lengthSeconds, 10),
        thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || '',
        channel: videoDetails.author?.name || videoDetails.ownerChannelName || 'Unknown',
        channelUrl: videoDetails.author?.channel_url || '',
        uploadDate: new Date(videoDetails.publishDate || Date.now()),
        availableQualities: uniqueQualities,
      };

      cache.set(videoId, metadata);
      return metadata;
    } catch (err: unknown) {
      if (err instanceof Error) {
        logger.error('Metadata fetch failed', { url, error: err.message });
        if (err.message.includes('Private')) throw Errors.privateVideo();
        if (err.message.includes('age')) throw Errors.ageRestricted();
        if (err.message.includes('unavailable') || err.message.includes('not found')) {
          throw Errors.unavailable();
        }
        if (err.message.includes('Live') || err.message.includes('live')) {
          throw Errors.liveStream();
        }
      }
      throw Errors.internal();
    }
  }

  invalidateCache(videoId: string): void {
    cache.del(videoId);
  }
}
