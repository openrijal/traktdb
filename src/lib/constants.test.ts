import { describe, it, expect } from 'vitest';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE_URL } from './constants';

describe('constants', () => {
    it('TMDB_IMAGE_BASE_URL points to TMDB CDN', () => {
        expect(TMDB_IMAGE_BASE_URL).toBe('https://image.tmdb.org/t/p/w500');
    });

    it('PLACEHOLDER_IMAGE_URL is a data URI SVG (fix #133)', () => {
        expect(PLACEHOLDER_IMAGE_URL).toMatch(/^data:image\/svg\+xml,/);
    });

    it('PLACEHOLDER_IMAGE_URL does not use external service', () => {
        expect(PLACEHOLDER_IMAGE_URL).not.toContain('via.placeholder.com');
        expect(PLACEHOLDER_IMAGE_URL).not.toMatch(/^https?:\/\//);
    });

    it('PLACEHOLDER_IMAGE_URL contains "No Image" text', () => {
        expect(decodeURIComponent(PLACEHOLDER_IMAGE_URL)).toContain('No Image');
    });
});
