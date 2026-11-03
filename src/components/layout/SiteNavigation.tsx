import { useEffect, useState } from 'react';
import { Heart, LayoutDashboard, ShoppingBag, User } from 'lucide-react';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CATALOG_NAV_ITEM, HOME_NAV_ITEM, type NavItem } from '@/components/layout/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteSearchPanel } from '@/components/layout/SiteSearchPanel';
import { SiteSidebar } from '@/components/layout/SiteSidebar';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useCurrentUrl } from '@/lib/router';

export function SiteNavigation() {
  const currentUrl = useCurrentUrl();
  const { cartIds, favoriteIds } = useStore();
  const { user, profile } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [currentUrl.pathname, currentUrl.search]);

  const accountItem: NavItem = user
    ? { label: 'Minha conta', to: '/conta', icon: User }
    : { label: 'Entrar', to: '/entrar', icon: User };
  const personalItems: NavItem[] = [
    { label: 'Favoritos', to: '/favoritos', icon: Heart, count: favoriteIds.length },
    { label: 'Carrinho', to: '/carrinho', icon: ShoppingBag, count: cartIds.length },
    accountItem,
  ];
  const adminItem: NavItem | null = profile?.role === 'admin' ? { label: 'Painel', to: '/admin', icon: LayoutDashboard } : null;
  const toggleSearch = () => setIsSearchOpen((open) => !open);

  return (
    <>
      <SiteSidebar
        currentUrl={currentUrl}
        personalItems={personalItems}
        adminItem={adminItem}
        isSearchOpen={isSearchOpen}
        onSearchToggle={toggleSearch}
      />
      <SiteHeader
        currentUrl={currentUrl}
        accountItem={accountItem}
        adminItem={adminItem}
        isSearchOpen={isSearchOpen}
        onSearchToggle={toggleSearch}
      />
      <MobileBottomNav currentUrl={currentUrl} items={[HOME_NAV_ITEM, CATALOG_NAV_ITEM, ...personalItems]} />
      {isSearchOpen && <SiteSearchPanel onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
