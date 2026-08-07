import { describe, expect, it } from 'vitest';
import { isCompleteStory, normalizeCampaignUrl } from './validation';

describe('release validation', () => {
  it('normalizes campaign HTTPS links', () => {
    expect(normalizeCampaignUrl('example.com/campaign')).toBe('https://example.com/campaign');
    expect(normalizeCampaignUrl('not a url')).toBeNull();
  });

  it('requires media for non-text stories', () => {
    const base = { title: 'Title', description: 'Body', location: 'Wardha', category: 'Safety', type: 'Reel' };
    expect(isCompleteStory({ ...base, mediaType: 'video', mediaUrl: null })).toBe(false);
    expect(isCompleteStory({ ...base, mediaType: 'video', mediaUrl: 'https://example.com/video.mp4' })).toBe(true);
    expect(isCompleteStory({ ...base, type: 'Article', mediaType: 'text', mediaUrl: null })).toBe(true);
  });
});
