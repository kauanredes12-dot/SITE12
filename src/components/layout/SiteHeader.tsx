import { useEffect, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { SHOP_NAV_ITEMS, type NavItem } from '@/components/layout/navigation';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/lib/router';

type SiteHeaderProps = {
  currentUrl: URL;
  accountItem: NavItem;
  adminItem: NavItem | null;
  isSearchOpen: boolean;
  onSearchToggle: () => void;
};

const ICON_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-brand-50 hover:text-brand-800';

export function SiteHeader({ currentUrl, accountItem, adminItem, isSearchOpen, onSearchToggle }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname, search } = currentUrl;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname, search]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/90 backdrop-blur-md lg:hidden">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="EDVORA, página inicial" className="shrink-0">
          <Logo />
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSearchToggle}
            aria-label="Pesquisar produtos"
            aria-expanded={isSearchOpen}
            className={ICON_BUTTON}
          >
            <Search size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            className={ICON_BUTTON}
          >
            {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav aria-label="Menu mobile" className="border-t border-ink-200/70 bg-white">
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {SHOP_NAV_ITEMS.map((item) => (
              <li key={item.label} className="border-b border-ink-100 last:border-0">
                <Link to={item.to} className="block py-4 text-base font-semibold text-ink-900 hover:text-brand-700">
                  {item.label}
                </Link>
              </li>
            ))}
            {adminItem && (
              <li className="border-b border-ink-100">
                <Link to={adminItem.to} className="flex items-center gap-2 py-4 text-base font-semibold text-ink-900 hover:text-brand-700">
                  <adminItem.icon size={18} aria-hidden="true" />
                  Painel Administrativo
                </Link>
              </li>
            )}
            <li className="border-t border-ink-200/70">
              <Link to={accountItem.to} className="block py-4 text-base font-semibold text-ink-900 hover:text-brand-700">
                {accountItem.label}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
