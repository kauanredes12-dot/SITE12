import type { Product } from '@/types/store';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatPrice(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function isOnSale(product: Product): boolean {
  return product.promoPriceCents !== null;
}

export function getCurrentPriceCents(product: Product): number {
  return product.promoPriceCents ?? product.priceCents;
}

export function getDiscountCents(product: Product): number {
  return product.promoPriceCents === null ? 0 : product.priceCents - product.promoPriceCents;
}

export function getDiscountPercent(product: Product): number {
  if (product.promoPriceCents === null || product.priceCents === 0) return 0;
  return Math.round((getDiscountCents(product) / product.priceCents) * 100);
}
