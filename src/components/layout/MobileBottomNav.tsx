import { NavCountBadge } from '@/components/layout/NavCountBadge';
import { isNavItemActive, type NavItem } from '@/components/layout/navigation';
import { Link } from '@/lib/router';

export function MobileBottomNav({ currentUrl, items }: { currentUrl: URL; items: NavItem[] }) {
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/95 backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isNavItemActive(currentUrl, item.to);
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className="group flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
              >
                <span
                  className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 ${
                    active ? 'bg-brand-100 text-brand-800' : 'text-ink-500 group-hover:text-ink-900'
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <NavCountBadge count={item.count} />
                </span>
                <span className={active ? 'text-ink-900' : 'text-ink-500'}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
