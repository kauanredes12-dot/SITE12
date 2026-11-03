import type { CheckoutPlatform, Product } from '@/types/store';

export type CheckoutOption = {
  platform: CheckoutPlatform;
  label: string;
  url: string;
};

export function getCheckoutOptions(product: Product): CheckoutOption[] {
  const options: CheckoutOption[] = [];
  if (product.kiwifyEnabled && product.kiwifyUrl) {
    options.push({ platform: 'kiwify', label: 'Kiwify', url: product.kiwifyUrl });
  }
  if (product.caktoEnabled && product.caktoUrl) {
    options.push({ platform: 'cakto', label: 'Cakto', url: product.caktoUrl });
  }
  return options;
}
