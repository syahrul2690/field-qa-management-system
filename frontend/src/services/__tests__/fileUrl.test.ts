import { describe, expect, it } from 'vitest';
import { getPublicFileUrl } from '../fileUrl';

describe('getPublicFileUrl', () => {
  it('uses the deployed SPA origin when no API URL is configured', () => {
    expect(getPublicFileUrl('documents\\review.pdf', undefined, 'http://qa.example.test'))
      .toBe('http://qa.example.test/uploads/documents/review.pdf');
  });

  it('supports an API URL with an /api suffix', () => {
    expect(getPublicFileUrl('/documents/review.pdf', 'https://api.example.test/api/'))
      .toBe('https://api.example.test/uploads/documents/review.pdf');
  });
});
