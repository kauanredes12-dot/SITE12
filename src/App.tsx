import { useEffect, type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteNavigation } from '@/components/layout/SiteNavigation';
import { EmptyState } from '@/components/ui/StatusMessage';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { useCurrentUrl, Link } from '@/lib/router';
import { buttonStyles } from '@/components/ui/Button';
import { CartPage } from '@/pages/CartPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { AccountPage } from '@/pages/AccountPage';
import { AdminArea } from '@/pages/admin/AdminArea';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { ProductPage } from '@/pages/ProductPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { SignupPage } from '@/pages/SignupPage';

const PRODUCT_PATH = /^\/produtos\/([^/]+)\/?$/;

function useScrollOnRouteChange(pathname: string, hash: string) {
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
}

function renderPage(url: URL): ReactNode {
  const productMatch = url.pathname.match(PRODUCT_PATH);
  if (productMatch) return <ProductPage key={productMatch[1]} slug={decodeURIComponent(productMatch[1])} />;

  switch (url.pathname) {
    case '/':
      return <HomePage />;
    case '/produtos':
      return <CatalogPage search={url.search} />;
    case '/carrinho':
      return <CartPage />;
    case '/favoritos':
      return <FavoritesPage />;
    case '/entrar':
      return <LoginPage />;
    case '/cadastro':
      return <SignupPage />;
    case '/esqueci-senha':
      return <ForgotPasswordPage />;
    case '/redefinir-senha':
      return <ResetPasswordPage />;
    case '/conta':
      return <AccountPage />;
    default:
      return (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={<BookOpen size={28} aria-hidden="true" />}
            title="Página não encontrada"
            description="O endereço que você acessou não existe ou foi movido."
            action={
              <Link to="/" className={buttonStyles({ size: 'md' })}>
                Voltar para a página inicial
              </Link>
            }
          />
        </div>
      );
  }
}

function App() {
  const url = useCurrentUrl();
  useScrollOnRouteChange(url.pathname, url.hash);

  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    return (
      <AuthProvider>
        <AdminArea />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <StoreProvider>
        <div className="flex min-h-screen flex-col pb-16 lg:pb-0 lg:pl-24">
          <SiteNavigation />
          <main className="flex-1">{renderPage(url)}</main>
          <SiteFooter />
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
