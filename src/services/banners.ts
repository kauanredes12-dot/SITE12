import { supabase } from '@/lib/supabase';
import type { HomeBanner } from '@/types/banners';

export const BANNER_BUCKET = 'home-banners';
const LOAD_ERROR = 'Não foi possível carregar os banners. Tente novamente.';
const SAVE_ERROR = 'Não foi possível salvar o banner. Tente novamente.';
const DELETE_ERROR = 'Não foi possível excluir o banner. Tente novamente.';
const REORDER_ERROR = 'Não foi possível alterar a ordem dos banners. Tente novamente.';

export const BANNER_SELECT =
  'id, desktop_image_url, mobile_image_url, link_url, alt_text, display_seconds, sort_order, is_active, created_at, updated_at';

export type BannerRow = {
  id: string;
  desktop_image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  alt_text: string;
  display_seconds: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BannerPayload = {
  desktop_image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  alt_text: string;
  display_seconds: number;
  sort_order: number;
  is_active: boolean;
};

export function mapBanner(row: BannerRow): HomeBanner {
  return {
    id: row.id,
    desktopImageUrl: row.desktop_image_url,
    mobileImageUrl: row.mobile_image_url,
    linkUrl: row.link_url,
    altText: row.alt_text,
    displaySeconds: row.display_seconds,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function validateBannerLink(value: string): string | null {
  if (!value) return null;
  return /^https:\/\/\S+$/i.test(value) ? null : 'O link deve começar com https://';
}

export async function fetchActiveBanners(): Promise<HomeBanner[]> {
  const { data, error } = await supabase
    .from('home_banners')
    .select(BANNER_SELECT)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as BannerRow[]).map(mapBanner);
}

export async function fetchAdminBanners(): Promise<HomeBanner[]> {
  const { data, error } = await supabase
    .from('home_banners')
    .select(BANNER_SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as BannerRow[]).map(mapBanner);
}

export async function saveBanner(id: string | null, payload: BannerPayload): Promise<void> {
  const query = id
    ? supabase.from('home_banners').update(payload).eq('id', id).select('id')
    : supabase.from('home_banners').insert(payload).select('id');
  const { data, error } = await query;
  if (error || !data || data.length === 0) throw new Error(SAVE_ERROR);
}

export async function setBannerActive(id: string, isActive: boolean): Promise<void> {
  const { data, error } = await supabase
    .from('home_banners')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('id');
  if (error || !data || data.length === 0) throw new Error(SAVE_ERROR);
}

export async function saveBannerOrder(orderedIds: string[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('home_banners').update({ sort_order: index }).eq('id', id).select('id'),
    ),
  );
  if (results.some(({ error, data }) => error || !data || data.length === 0)) throw new Error(REORDER_ERROR);
}

export async function deleteBanner(id: string): Promise<void> {
  const { data, error } = await supabase.from('home_banners').delete().eq('id', id).select('id');
  if (error || !data || data.length === 0) throw new Error(DELETE_ERROR);
}
