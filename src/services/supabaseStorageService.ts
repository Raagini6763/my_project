const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rhrgbxtfywvyuoogdjnj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_UQX2bbzeOUguUQiT_ZrmDA_xpcCDihF';
const STORAGE_BUCKET = 'sample';
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heic',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/webm': 'webm',
  'audio/wav': 'wav',
};

export const uploadStoryMedia = async (mediaUri?: string | null) => {
  if (!mediaUri) return null;

  const source = await fetch(mediaUri);
  if (!source.ok) throw new Error('The selected media file could not be read.');
  const blob = await source.blob();
  if (blob.size > MAX_FILE_SIZE) throw new Error('Media files must be smaller than 50 MB.');

  const uriExtension = mediaUri.split('?')[0].split('.').pop()?.toLowerCase();
  const extensionMimeTypes: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic',
    mp4: 'video/mp4', mov: 'video/quicktime', mp3: 'audio/mpeg', m4a: 'audio/mp4', webm: 'audio/webm', wav: 'audio/wav',
  };
  const contentType = blob.type.toLowerCase() || extensionMimeTypes[uriExtension || ''] || '';
  const extension = MIME_EXTENSIONS[contentType];
  if (!extension) throw new Error('Choose a supported image, video, or audio file.');

  const objectPath = `stories/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'false',
    },
    body: blob,
  });

  if (!response.ok) {
    const detail = await response.text();
    console.warn('Supabase media upload failed:', response.status, detail);
    if (response.status === 401 || response.status === 403) {
      throw new Error('Supabase upload permission is not configured for the sample bucket.');
    }
    throw new Error('The media file could not be uploaded. Please try again.');
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};
