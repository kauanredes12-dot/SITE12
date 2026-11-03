import { ShieldAlert } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EmptyState, LoadingState } from '@/components/ui/StatusMessage';
import { buttonStyles } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Link, navigate, useCurrentUrl } from '@/lib/router';
import { AdminBannersPage } from '@/pages/admin/AdminBannersPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductEditPage } from '@/pages/admin/AdminProductEditPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { useEffect, type ReactNode } from 'react';

const PRODUCT_EDIT_PATH = /^\/admin\/produtos\/([^/]+)\/?$/;

function renderAdminPage(pathname: string): ReactNode {
  if (pathname === '/admin/produtos/novo') return <AdminProductEditPage />;

  const editMatch = pathname.match(PRODUCT_EDIT_PATH);
  if (editMatch) return <AdminProductEditPage key={editMatch[1]} productId={decodeURIComponent(editMatch[1])} />;

  switch (pathname) {
    case '/admin':
      return <AdminDashboardPage />;
    case '/admin/produtos':
      return <AdminProductsPage />;
    case '/admin/categorias':
      return <AdminCategoriesPage />;
    case '/admin/banners':
      return <AdminBannersPage />;
    default:
      return (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            icon={<ShieldAlert size={28} aria-hidden="true" />}
            title="Página não encontrada"
            description="Este endereço não existe no painel administrativo."
            action={
              <Link to="/admin" className={buttonStyles({ size: 'md' })}>
                Voltar ao painel
              </Link>
            }
          />
        </div>
      );
  }
}

export function AdminArea() {
  const url = useCurrentUrl();
  const { user, profile, isLoading, profileError } = useAuth();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isLoading && !user) navigate(`/entrar?next=${encodeURIComponent(url.pathname)}`, { replace: true });
  }, [isLoading, user, url.pathname]);

  if (isLoading || (user && !profile && !profileError)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <LoadingState label="Verificando acesso..." />
      </div>
    );
  }

  if (!user) return null;

  if (profileError || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<ShieldAlert size={28} aria-hidden="true" />}
          title="Não foi possível verificar seu acesso"
          description="Atualize a página e tente novamente em instantes."
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<ShieldAlert size={28} aria-hidden="true" />}
          title="Acesso restrito"
          description="Esta área é exclusiva para administradores da EDVORA."
          action={
            <Link to="/" className={buttonStyles({ size: 'md' })}>
              Voltar para a loja
            </Link>
          }
        />
      </div>
    );
  }

  return <AdminLayout>{renderAdminPage(url.pathname)}</AdminLayout>;
}
