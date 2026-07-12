import { ValidationService } from '../src/services/validation.service';

describe('ValidationService', () => {
  const service = new ValidationService();

  describe('validateUrl', () => {
    it('should return videoId for valid URL', () => {
      const id = service.validateUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('should throw for invalid URL', () => {
      expect(() => service.validateUrl('not-a-url')).toThrow('Invalid YouTube URL');
    });

    it('should throw for empty string', () => {
      expect(() => service.validateUrl('')).toThrow('Invalid YouTube URL');
    });
  });

  describe('validateFormat', () => {
    it('should accept valid video format', () => {
      expect(() => service.validateFormat('mp4', '720p')).not.toThrow();
    });

    it('should accept valid audio format', () => {
      expect(() => service.validateFormat('mp3', '128')).not.toThrow();
    });

    it('should reject invalid video quality', () => {
      expect(() => service.validateFormat('mp4', '4k')).toThrow('Invalid video quality');
    });

    it('should reject invalid bitrate', () => {
      expect(() => service.validateFormat('mp3', '999')).toThrow('Invalid audio bitrate');
    });

    it('should reject invalid format', () => {
      expect(() => service.validateFormat('avi', '720p')).toThrow('Invalid format type');
    });
  });
});
