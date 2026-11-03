import type { Product } from '@/types/store';
import { getCurrentPriceCents } from '@/lib/pricing';

export type SortOption = 'popularidade' | 'lancamentos' | 'menor-preco' | 'maior-preco';
export type PriceRange = 'todos' | 'ate-30' | '30-60' | 'acima-60';

export type CatalogFilters = {
  query: string;
  categorySlug: string | null;
  format: string | null;
  priceRange: PriceRange;
  onlyPromotions: boolean;
  sort: SortOption;
};

export const DEFAULT_SORT: SortOption = 'popularidade';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularidade', label: 'Mais populares' },
  { value: 'lancamentos', label: 'Lançamentos' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
];

export const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'todos', label: 'Todos os preços' },
  { value: 'ate-30', label: 'Até R$ 30' },
  { value: '30-60', label: 'R$ 30 a R$ 60' },
  { value: 'acima-60', label: 'Acima de R$ 60' },
];

const PRICE_RANGE_BOUNDS_CENTS: Record<Exclude<PriceRange, 'todos'>, [number, number]> = {
  'ate-30': [0, 3000],
  '30-60': [3001, 6000],
  'acima-60': [6001, Number.POSITIVE_INFINITY],
};

function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function isPriceRange(value: string | null): value is PriceRange {
  return PRICE_RANGES.some((option) => option.value === value);
}

export function readCatalogFilters(params: URLSearchParams): CatalogFilters {
  const sortParam = params.get('ordem');
  const priceParam = params.get('preco');

  return {
    query: params.get('q')?.trim() ?? '',
    categorySlug: params.get('categoria') || null,
    format: params.get('formato') || null,
    priceRange: isPriceRange(priceParam) ? priceParam : 'todos',
    onlyPromotions: params.get('promocao') === '1',
    sort: isSortOption(sortParam) ? sortParam : DEFAULT_SORT,
  };
}

export function writeCatalogFilters(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.categorySlug) params.set('categoria', filters.categorySlug);
  if (filters.format) params.set('formato', filters.format);
  if (filters.priceRange !== 'todos') params.set('preco', filters.priceRange);
  if (filters.onlyPromotions) params.set('promocao', '1');
  if (filters.sort !== DEFAULT_SORT) params.set('ordem', filters.sort);
  return params;
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function matchesQuery(product: Product, query: string): boolean {
  const haystack = normalizeText(
    [
      product.title,
      product.subtitle ?? '',
      product.description,
      product.category?.name ?? '',
      ...product.benefits,
      ...product.tableOfContents,
    ].join(' '),
  );
  return normalizeText(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function matchesPriceRange(product: Product, range: PriceRange): boolean {
  if (range === 'todos') return true;
  const [min, max] = PRICE_RANGE_BOUNDS_CENTS[range];
  const price = getCurrentPriceCents(product);
  return price >= min && price <= max;
}

export function getAvailableFormats(products: Product[]): string[] {
  const formats = new Map<string, string>();
  for (const product of products) {
    const label = product.format.trim();
    if (label) formats.set(normalizeText(label), label);
  }
  return [...formats.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function applyCatalogFilters(products: Product[], filters: CatalogFilters): Product[] {
  const filtered = products.filter(
    (product) =>
      (!filters.query || matchesQuery(product, filters.query)) &&
      (!filters.categorySlug || product.category?.slug === filters.categorySlug) &&
      (!filters.format || normalizeText(product.format) === normalizeText(filters.format)) &&
      matchesPriceRange(product, filters.priceRange) &&
      (!filters.onlyPromotions || product.promoPriceCents !== null),
  );

  const sorted = [...filtered];
  switch (filters.sort) {
    case 'popularidade':
      return sorted.sort((a, b) => b.salesCount - a.salesCount);
    case 'lancamentos':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'menor-preco':
      return sorted.sort((a, b) => getCurrentPriceCents(a) - getCurrentPriceCents(b));
    case 'maior-preco':
      return sorted.sort((a, b) => getCurrentPriceCents(b) - getCurrentPriceCents(a));
  }
}
