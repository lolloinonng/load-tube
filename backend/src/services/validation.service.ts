import { isValidYouTubeUrl, extractVideoId } from '../utils/validation';
import { Errors } from '../utils/errors';

export class ValidationService {
  validateUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      throw Errors.invalidUrl();
    }
    url = url.trim();
    if (!isValidYouTubeUrl(url)) {
      throw Errors.invalidUrl();
    }
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw Errors.invalidUrl();
    }
    return videoId;
  }

  validateFormat(format: string, quality: string): void {
    const validVideoFormats = ['mp4'];
    const validAudioFormats = ['mp3'];
    const validVideoQualities = ['360p', '480p', '720p', '1080p'];
    const validAudioQualities = ['64', '128', '192', '320'];

    if (format === 'mp4') {
      if (!validVideoFormats.includes(format)) {
        throw new Error('Invalid video format');
      }
      if (!validVideoQualities.includes(quality)) {
        throw new Error('Invalid video quality');
      }
    } else if (format === 'mp3') {
      if (!validAudioFormats.includes(format)) {
        throw new Error('Invalid audio format');
      }
      if (!validAudioQualities.includes(quality)) {
        throw new Error('Invalid audio bitrate');
      }
    } else {
      throw new Error('Invalid format type');
    }
  }

  validateAdminCredentials(username: string, password: string): void {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
  }
}
