import { isValidYouTubeUrl, extractVideoId, sanitizeFilename } from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('isValidYouTubeUrl', () => {
    it('should accept standard watch URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('should accept short youtu.be URLs', () => {
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('should accept embed URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });

    it('should accept shorts URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(true);
    });

    it('should reject non-YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://vimeo.com/123456')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidYouTubeUrl('')).toBe(false);
    });

    it('should reject invalid video IDs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=invalid')).toBe(false);
    });
  });

  describe('extractVideoId', () => {
    it('should extract from standard URL', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract from short URL', () => {
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      expect(extractVideoId('https://example.com')).toBeNull();
    });
  });

  describe('sanitizeFilename', () => {
    it('should replace special characters', () => {
      expect(sanitizeFilename('file:name/test')).toBe('file_name_test');
    });

    it('should truncate long names', () => {
      const long = 'a'.repeat(250);
      expect(sanitizeFilename(long).length).toBe(200);
    });
  });
});
