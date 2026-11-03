import { House, LayoutGrid, Shapes, Tag, TrendingUp, type LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  count?: number;
};

export const HOME_NAV_ITEM: NavItem = { label: 'Início', to: '/', icon: House };
export const CATALOG_NAV_ITEM: NavItem = { label: 'Produtos', to: '/produtos', icon: LayoutGrid };

export const SHOP_NAV_ITEMS: NavItem[] = [
  HOME_NAV_ITEM,
  CATALOG_NAV_ITEM,
  { label: 'Categorias', to: '/#categorias', icon: Shapes },
  { label: 'Mais vendidos', to: '/produtos?ordem=popularidade', icon: TrendingUp },
  { label: 'Ofertas', to: '/produtos?promocao=1', icon: Tag },
];

const CATALOG_FILTER_PARAMS = ['ordem', 'promocao'];

export function isNavItemActive(currentUrl: URL, to: string): boolean {
  const target = new URL(to, currentUrl.origin);
  if (target.pathname !== currentUrl.pathname || target.hash !== currentUrl.hash) return false;
  for (const [key, value] of target.searchParams) {
    if (currentUrl.searchParams.get(key) !== value) return false;
  }
  if (target.search === '') {
    return !CATALOG_FILTER_PARAMS.some((key) => currentUrl.searchParams.has(key));
  }
  return true;
}
