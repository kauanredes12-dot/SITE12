import { Search } from 'lucide-react';
import { NavCountBadge } from '@/components/layout/NavCountBadge';
import { SHOP_NAV_ITEMS, isNavItemActive, type NavItem } from '@/components/layout/navigation';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/lib/router';

type SiteSidebarProps = {
  currentUrl: URL;
  personalItems: NavItem[];
  adminItem: NavItem | null;
  isSearchOpen: boolean;
  onSearchToggle: () => void;
};

const TILE_CLASS =
  'group relative flex w-full flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-[11px] font-semibold leading-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

function TileContent({ item, active, icon: Icon }: { item: { label: string; count?: number }; active: boolean; icon: NavItem['icon'] }) {
  return (
    <>
      {active && (
        <span aria-hidden="true" className="absolute -left-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />
      )}
      <span
        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-105 ${
          active ? 'bg-brand-100 text-brand-800' : 'text-ink-500 group-hover:bg-ink-100 group-hover:text-ink-900'
        }`}
      >
        <Icon size={20} aria-hidden="true" />
        <NavCountBadge count={item.count} />
      </span>
      <span className={active ? 'text-ink-900' : 'text-ink-500 group-hover:text-ink-900'}>{item.label}</span>
    </>
  );
}

function SidebarLink({ item, currentUrl }: { item: NavItem; currentUrl: URL }) {
  const active = isNavItemActive(currentUrl, item.to);
  return (
    <Link to={item.to} aria-current={active ? 'page' : undefined} className={TILE_CLASS}>
      <TileContent item={item} active={active} icon={item.icon} />
    </Link>
  );
}

export function SiteSidebar({ currentUrl, personalItems, adminItem, isSearchOpen, onSearchToggle }: SiteSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-24 flex-col items-center border-r border-ink-200/70 bg-white py-6 lg:flex">
      <Link
        to="/"
        aria-label="EDVORA, página inicial"
        className="mb-6 shrink-0 rounded-2xl transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Logo />
      </Link>

      <nav aria-label="Navegação principal" className="flex min-h-0 w-full flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
        <button
          type="button"
          onClick={onSearchToggle}
          aria-label="Pesquisar produtos"
          aria-expanded={isSearchOpen}
          className={TILE_CLASS}
        >
          <TileContent item={{ label: 'Pesquisar' }} active={isSearchOpen} icon={Search} />
        </button>

        {SHOP_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.label} item={item} currentUrl={currentUrl} />
        ))}

        <div aria-hidden="true" className="mx-3 my-2 h-px bg-ink-200/70" />

        {personalItems.map((item) => (
          <SidebarLink key={item.label} item={item} currentUrl={currentUrl} />
        ))}
      </nav>

      {adminItem && (
        <div className="w-full px-2 pt-4">
          <SidebarLink item={adminItem} currentUrl={currentUrl} />
        </div>
      )}
    </aside>
  );
}
