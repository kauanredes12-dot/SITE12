import { supabase } from '@/lib/supabase';
import type { Category, CheckoutPlatform, Product } from '@/types/store';

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  benefits: string[] | null;
  table_of_contents: string[] | null;
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
  sales_count: number;
  created_at: string;
  updated_at: string;
  category: CategoryRow | null;
};

export const PRODUCT_SELECT =
  'id, slug, title, subtitle, description, benefits, table_of_contents, access_info, price_cents, promo_price_cents, cover_url, is_active, checkout_platform, kiwify_url, cakto_url, kiwify_enabled, cakto_enabled, format, pages, is_featured, is_bestseller, sales_count, created_at, updated_at, category:categories(id, name, slug, description, image_url, sort_order)';

export const CATEGORY_SELECT = 'id, name, slug, description, image_url, sort_order';

export const LOAD_ERROR = 'Não foi possível carregar os dados. Tente novamente.';

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  };
}

function resolveCheckoutUrl(row: ProductRow): string | null {
  if (row.checkout_platform === 'cakto') return row.cakto_enabled ? row.cakto_url : null;
  return row.kiwify_enabled ? row.kiwify_url : null;
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    benefits: row.benefits ?? [],
    tableOfContents: row.table_of_contents ?? [],
    accessInfo: row.access_info,
    category: row.category ? mapCategory(row.category) : null,
    priceCents: row.price_cents,
    promoPriceCents: row.promo_price_cents,
    coverUrl: row.cover_url,
    isActive: row.is_active,
    checkoutPlatform: row.checkout_platform,
    kiwifyUrl: row.kiwify_url,
    caktoUrl: row.cakto_url,
    kiwifyEnabled: row.kiwify_enabled,
    caktoEnabled: row.cakto_enabled,
    checkoutUrl: resolveCheckoutUrl(row),
    format: row.format,
    pages: row.pages,
    isFeatured: row.is_featured,
    isBestseller: row.is_bestseller,
    salesCount: row.sales_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function activeProducts() {
  return supabase.from('products').select(PRODUCT_SELECT).eq('is_active', true);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_SELECT)
    .order('sort_order', { ascending: true });
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as CategoryRow[]).map(mapCategory);
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await activeProducts().order('created_at', { ascending: false });
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function fetchStorefront(): Promise<[Category[], Product[]]> {
  return Promise.all([fetchCategories(), fetchProducts()]);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await activeProducts().eq('slug', slug).maybeSingle();
  if (error) throw new Error(LOAD_ERROR);
  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function fetchRelatedProducts(product: Product): Promise<Product[]> {
  if (!product.category) return [];
  const { data, error } = await activeProducts()
    .eq('category_id', product.category.id)
    .neq('id', product.id)
    .order('sales_count', { ascending: false })
    .limit(3);
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const { data, error } = await activeProducts().in('id', ids);
  if (error || !data) throw new Error(LOAD_ERROR);
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export type NewsletterInput = { name: string; email: string };
export type NewsletterResult = 'subscribed' | 'already-subscribed';

const UNIQUE_VIOLATION = '23505';

export async function subscribeToNewsletter({
  name,
  email,
}: NewsletterInput): Promise<NewsletterResult> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ name: name.trim(), email: email.trim().toLowerCase() });

  if (!error) return 'subscribed';
  if (error.code === UNIQUE_VIOLATION) return 'already-subscribed';
  throw new Error('Não foi possível concluir sua inscrição. Tente novamente.');
}
