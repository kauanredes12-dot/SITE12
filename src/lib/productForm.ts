import type { ProductPayload } from '@/services/adminProducts';
import type { CheckoutPlatform, Product } from '@/types/store';

export type ProductFormValues = {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  coverUrl: string | null;
  price: string;
  promoPrice: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  benefits: string;
  tableOfContents: string;
  accessInfo: string;
  format: string;
  pages: string;
  checkoutPlatform: CheckoutPlatform;
  kiwifyUrl: string;
  kiwifyEnabled: boolean;
  caktoUrl: string;
  caktoEnabled: boolean;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  title: '',
  subtitle: '',
  description: '',
  categoryId: '',
  coverUrl: null,
  price: '',
  promoPrice: '',
  isActive: true,
  isFeatured: false,
  isBestseller: false,
  benefits: '',
  tableOfContents: '',
  accessInfo: '',
  format: 'PDF',
  pages: '',
  checkoutPlatform: 'kiwify',
  kiwifyUrl: '',
  caktoUrl: '',
  kiwifyEnabled: true,
  caktoEnabled: true,
};

function centsToInput(cents: number | null): string {
  return cents === null ? '' : (cents / 100).toFixed(2).replace('.', ',');
}

export function productToForm(product: Product): ProductFormValues {
  return {
    title: product.title,
    subtitle: product.subtitle ?? '',
    description: product.description,
    categoryId: product.category?.id ?? '',
    coverUrl: product.coverUrl,
    price: centsToInput(product.priceCents),
    promoPrice: centsToInput(product.promoPriceCents),
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isBestseller: product.isBestseller,
    benefits: product.benefits.join('\n'),
    tableOfContents: product.tableOfContents.join('\n'),
    accessInfo: product.accessInfo ?? '',
    format: product.format,
    pages: product.pages === null ? '' : String(product.pages),
    checkoutPlatform: product.checkoutPlatform,
    kiwifyUrl: product.kiwifyUrl ?? '',
    caktoUrl: product.caktoUrl ?? '',
    kiwifyEnabled: product.kiwifyEnabled,
    caktoEnabled: product.caktoEnabled,
  };
}

export function parsePriceToCents(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, '').replace(/^R\$/, '');
  if (!/^\d+([.,]\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized.replace(',', '.')) * 100);
}

function splitLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isValidHttpsUrl(raw: string): boolean {
  try {
    return new URL(raw.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (values.title.trim().length < 3) errors.title = 'Informe um título com pelo menos 3 caracteres.';
  if (values.title.trim().length > 160) errors.title = 'O título deve ter no máximo 160 caracteres.';
  if (values.description.trim().length < 10) errors.description = 'Descreva o produto com pelo menos 10 caracteres.';
  if (!values.categoryId) errors.categoryId = 'Escolha uma categoria.';

  const price = parsePriceToCents(values.price);
  if (price === null || price <= 0) errors.price = 'Informe um preço válido, por exemplo 29,90.';

  if (values.promoPrice.trim()) {
    const promo = parsePriceToCents(values.promoPrice);
    if (promo === null || promo < 0) errors.promoPrice = 'Informe um preço promocional válido.';
    else if (price !== null && promo >= price) errors.promoPrice = 'O preço promocional deve ser menor que o preço original.';
  }

  if (values.pages.trim() && !/^\d{1,5}$/.test(values.pages.trim())) {
    errors.pages = 'Informe apenas o número de páginas.';
  }

  if (values.kiwifyUrl.trim() && !isValidHttpsUrl(values.kiwifyUrl)) {
    errors.kiwifyUrl = 'O link precisa começar com https://';
  }
  if (values.caktoUrl.trim() && !isValidHttpsUrl(values.caktoUrl)) {
    errors.caktoUrl = 'O link precisa começar com https://';
  }

  const selectedUrl = values.checkoutPlatform === 'kiwify' ? values.kiwifyUrl : values.caktoUrl;
  const selectedEnabled = values.checkoutPlatform === 'kiwify' ? values.kiwifyEnabled : values.caktoEnabled;
  if (selectedEnabled && !selectedUrl.trim() && values.isActive) {
    errors.checkoutPlatform = 'Para publicar o produto, informe o link da plataforma escolhida.';
  }

  return errors;
}

export function formToPayload(values: ProductFormValues): ProductPayload {
  const price = parsePriceToCents(values.price) ?? 0;
  const promo = values.promoPrice.trim() ? parsePriceToCents(values.promoPrice) : null;
  const nullable = (raw: string) => (raw.trim() ? raw.trim() : null);

  return {
    title: values.title.trim(),
    subtitle: nullable(values.subtitle),
    description: values.description.trim(),
    category_id: values.categoryId || null,
    benefits: splitLines(values.benefits),
    table_of_contents: splitLines(values.tableOfContents),
    access_info: nullable(values.accessInfo),
    price_cents: price,
    promo_price_cents: promo,
    cover_url: values.coverUrl,
    is_active: values.isActive,
    checkout_platform: values.checkoutPlatform,
    kiwify_url: nullable(values.kiwifyUrl),
    cakto_url: nullable(values.caktoUrl),
    kiwify_enabled: values.kiwifyEnabled,
    cakto_enabled: values.caktoEnabled,
    format: values.format.trim() || 'PDF',
    pages: values.pages.trim() ? Number(values.pages.trim()) : null,
    is_featured: values.isFeatured,
    is_bestseller: values.isBestseller,
  };
}
