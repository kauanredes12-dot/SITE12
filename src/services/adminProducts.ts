import { supabase } from '@/lib/supabase';
import { LOAD_ERROR, PRODUCT_SELECT, mapProduct, type ProductRow } from '@/services/catalog';
import type { CheckoutPlatform, Product } from '@/types/store';

const SAVE_ERROR = 'Não foi possível salvar o produto. Tente novamente.';
const DELETE_ERROR = 'Não foi possível excluir o produto. Tente novamente.';
const UPDATE_ERROR = 'Não foi possível atualizar o produto. Tente novamente.';
const SLUG_TAKEN = 'Já existe um produto com um endereço parecido. Altere o título e tente de novo.';

export type ProductPayload = {
  title: string;
  subtitle: string | null;
  description: string;
  category_id: string | null;
  benefits: string[];
  table_of_contents: string[];
  access_info: string | null;
  price_cents: number;
  promo_price_cents: number | null;
  cover_url: string | null;
  is_active: boolean;
  checkout_platform: CheckoutPlatform;
  kiwify_url: string | null;
  cakto_url: string | null;
  kiwify_enabled: boolean;
  cakto_enabled: boolean;
  format: string;
  pages: number | null;
  is_featured: boolean;
  is_bestseller: boolean;
};

export type DashboardStats = {
  total: number;
  active: number;
  inactive: number;
  onPromotion: number;
  recent: Product[];
};

const UNIQUE_VIOLATION = '23505';

export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function createSlug(title: string): string {
  const base = slugifyTitle(title) || 'produto';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function fetchAdminProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(LOAD_ERROR);
  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const countWhere = async (apply: (q: ReturnType<typeof baseCount>) => ReturnType<typeof baseCount>) => {
    const { count, error } = await apply(baseCount());
    if (error) throw new Error(LOAD_ERROR);
    return count ?? 0;
  };

  const [total, active, onPromotion, recentResult] = await Promise.all([
    countWhere((q) => q),
    countWhere((q) => q.eq('is_active', true)),
    countWhere((q) => q.not('promo_price_cents', 'is', null)),
    supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (recentResult.error || !recentResult.data) throw new Error(LOAD_ERROR);

  return {
    total,
    active,
    inactive: total - active,
    onPromotion,
    recent: (recentResult.data as unknown as ProductRow[]).map(mapProduct),
  };
}

function baseCount() {
  return supabase.from('products').select('id', { count: 'exact', head: true });
}

function assertRowWritten(rows: unknown[] | null, error: { code?: string; message: string } | null, fallback: string): void {
  if (error) {
    console.error('product write failed', error);
    throw new Error(error.code === UNIQUE_VIOLATION ? SLUG_TAKEN : fallback);
  }
  if (!rows || rows.length === 0) {
    console.error('product write affected no rows (check permissions)');
    throw new Error(fallback);
  }
}

export async function createProduct(title: string, payload: ProductPayload): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...payload, slug: createSlug(title) })
    .select('id');
  assertRowWritten(data, error, SAVE_ERROR);
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<void> {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('id');
  assertRowWritten(data, error, SAVE_ERROR);
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  const { data, error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id).select('id');
  assertRowWritten(data, error, UPDATE_ERROR);
}

export async function duplicateProduct(product: Product): Promise<void> {
  const { error } = await supabase.from('products').insert({
    slug: createSlug(`copia ${product.title}`),
    title: `Cópia de ${product.title}`,
    subtitle: product.subtitle,
    description: product.description,
    benefits: product.benefits,
    table_of_contents: product.tableOfContents,
    access_info: product.accessInfo,
    category_id: product.category?.id ?? null,
    price_cents: product.priceCents,
    promo_price_cents: product.promoPriceCents,
    cover_url: product.coverUrl,
    is_active: false,
    checkout_platform: product.checkoutPlatform,
    kiwify_url: product.kiwifyUrl,
    cakto_url: product.caktoUrl,
    kiwify_enabled: product.kiwifyEnabled,
    cakto_enabled: product.caktoEnabled,
    format: product.format,
    pages: product.pages,
    is_featured: false,
    is_bestseller: false,
  });
  if (error) throw new Error(error.code === UNIQUE_VIOLATION ? SLUG_TAKEN : SAVE_ERROR);
}

export async function deleteProduct(id: string): Promise<void> {
  const { data, error } = await supabase.from('products').delete().eq('id', id).select('id');
  if (error || !data || data.length === 0) {
    console.error('product delete failed', error);
    throw new Error(DELETE_ERROR);
  }
}
