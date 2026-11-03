import { supabase } from '@/lib/supabase';

export type ImageBucket = 'product-covers' | 'home-banners';

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_BANNER_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_ERROR = 'Não foi possível enviar a imagem. Tente novamente.';

export function validateImageFile(file: File, bucket: ImageBucket = 'product-covers'): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Envie uma imagem JPG, PNG ou WebP.';
  const limit = bucket === 'home-banners' ? MAX_BANNER_BYTES : MAX_BYTES;
  if (file.size > limit) return `A imagem deve ter no máximo ${limit / (1024 * 1024)} MB.`;
  return null;
}

export async function uploadImage(file: File, folder: string, bucket: ImageBucket = 'product-covers'): Promise<string> {
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${folder}/${id}.${extension}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });
  if (error) {
    console.error('image upload failed', error);
    throw new Error(UPLOAD_ERROR);
  }
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function removeImageByUrl(bucket: ImageBucket, url: string): Promise<void> {
  const marker = `/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = url.slice(index + marker.length);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error('image cleanup failed', error);
}
