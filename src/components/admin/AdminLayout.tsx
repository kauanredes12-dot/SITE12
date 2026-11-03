import { useState, type ReactNode } from 'react';
import { FolderTree, Images, LayoutDashboard, LogOut, Menu, Package, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { Link, useCurrentUrl } from '@/lib/router';

type AdminSection = 'dashboard' | 'produtos' | 'categorias' | 'banners';

const NAV_ITEMS: { id: AdminSection; label: string; to: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Painel', to: '/admin', icon: LayoutDashboard },
  { id: 'produtos', label: 'Produtos', to: '/admin/produtos', icon: Package },
  { id: 'categorias', label: 'Categorias', to: '/admin/categorias', icon: FolderTree },
  { id: 'banners', label: 'Banners', to: '/admin/banners', icon: Images },
];

function isActive(section: AdminSection, pathname: string): boolean {
  if (section === 'dashboard') return pathname === '/admin';
  return pathname.startsWith(`/admin/${section}`);
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const url = useCurrentUrl();
  const { signOut, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = (
    <nav aria-label="Menu do painel" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.id, url.pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            onClick={() => setIsMenuOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
              active ? 'bg-brand-500 text-ink-900' : 'text-ink-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarFooter = (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
      <div className="px-4">
        <p className="truncate text-sm font-semibold text-white">{profile?.fullName ?? 'Administrador'}</p>
        <p className="truncate text-xs text-ink-300">{profile?.email}</p>
      </div>
      <Link
        to="/"
        className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-100 transition-colors hover:bg-white/10 hover:text-white"
      >
        Ver loja
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-ink-100 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut size={18} aria-hidden="true" />
        Sair
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-ink-900 p-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="flex flex-col gap-8">
          <Link to="/admin" className="px-2">
            <Logo className="h-9 w-auto" />
          </Link>
          {navigation}
        </div>
        {sidebarFooter}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink-900 px-4 py-3 lg:hidden">
        <Link to="/admin" aria-label="Painel administrativo">
          <Logo className="h-8 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
        >
          {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[60px] z-20 flex flex-col justify-between overflow-y-auto bg-ink-900 p-4 lg:hidden">
          <div className="flex flex-col gap-6">{navigation}</div>
          {sidebarFooter}
        </div>
      )}

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
