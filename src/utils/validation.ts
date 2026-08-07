export const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export const isCompleteStory = (story: Record<string, unknown>) => {
  if (!hasText(story.title) || !hasText(story.description) || !hasText(story.location) || !hasText(story.category) || !hasText(story.type)) return false;
  return story.mediaType === 'text' || (hasText(story.mediaType) && hasText(story.mediaUrl));
};

export const normalizeCampaignUrl = (value: string) => {
  const candidate = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};
