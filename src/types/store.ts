export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export type CheckoutPlatform = 'kiwify' | 'cakto';

export type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  benefits: string[];
  tableOfContents: string[];
  accessInfo: string | null;
  category: Category | null;
  priceCents: number;
  promoPriceCents: number | null;
  coverUrl: string | null;
  isActive: boolean;
  checkoutPlatform: CheckoutPlatform;
  kiwifyUrl: string | null;
  caktoUrl: string | null;
  kiwifyEnabled: boolean;
  caktoEnabled: boolean;
  checkoutUrl: string | null;
  format: string;
  pages: number | null;
  isFeatured: boolean;
  isBestseller: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
};
