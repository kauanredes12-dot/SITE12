import { useEffect, useState } from 'react';
import { BookOpen, LayoutDashboard, LogOut } from 'lucide-react';
import { PasswordForm } from '@/components/account/PasswordForm';
import { ProfileForm } from '@/components/account/ProfileForm';
import { Button, buttonStyles } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { FormAlert } from '@/components/ui/FormAlert';
import { useAuth } from '@/context/AuthContext';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Link, navigate } from '@/lib/router';

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const CARD_CLASS = 'rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70 sm:p-8';

export function AccountPage() {
  useDocumentMeta('Minha conta | EDVORA', 'Gerencie seus dados, sua senha e suas compras na EDVORA.');
  const { user, profile, isLoading, profileError, refreshProfile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user && !isSigningOut) navigate('/entrar?next=/conta', { replace: true });
  }, [isLoading, user, isSigningOut]);

  if (isLoading) return <LoadingState label="Carregando sua conta..." />;
  if (!user) return null;

  if (profileError || !profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message="Não foi possível carregar seus dados. Tente novamente." onRetry={refreshProfile} />
      </div>
    );
  }

  const firstName = profile.fullName.split(' ')[0];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      navigate('/');
    } catch (cause) {
      setIsSigningOut(false);
      setSignOutError(cause instanceof Error ? cause.message : 'Não foi possível sair. Tente novamente.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="flex flex-col gap-6 border-b border-ink-200/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Área do cliente</p>
          <h1 className="text-3xl font-bold leading-tight text-ink-900 sm:text-4xl">Olá, {firstName}</h1>
          <p className="text-base leading-relaxed text-ink-500">
            Cliente desde {DATE_FORMAT.format(new Date(profile.createdAt))}
          </p>
        </div>
        <Button variant="secondary" onClick={handleSignOut} disabled={isSigningOut} className="self-start sm:self-auto">
          <LogOut size={18} aria-hidden="true" />
          {isSigningOut ? 'Saindo...' : 'Sair da conta'}
        </Button>
      </header>

      {signOutError && (
        <div className="mt-6">
          <FormAlert tone="error">{signOutError}</FormAlert>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section aria-labelledby="account-details" className={CARD_CLASS}>
            <h2 id="account-details" className="mb-6 text-xl font-bold text-ink-900">
              Dados pessoais
            </h2>
            <ProfileForm profile={profile} onSaved={refreshProfile} />
          </section>

          <section aria-labelledby="account-security" className={CARD_CLASS}>
            <h2 id="account-security" className="mb-2 text-xl font-bold text-ink-900">
              Alterar senha
            </h2>
            <p className="mb-6 text-base leading-relaxed text-ink-500">
              Para sua segurança, confirme a senha atual antes de criar uma nova.
            </p>
            <PasswordForm email={profile.email} />
          </section>
        </div>

        <div className="flex flex-col gap-6 self-start">
        {profile.role === 'admin' && (
          <aside aria-labelledby="account-admin" className={`${CARD_CLASS} flex flex-col gap-4`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-white">
              <LayoutDashboard size={22} aria-hidden="true" />
            </span>
            <h2 id="account-admin" className="text-xl font-bold text-ink-900">
              Painel Administrativo
            </h2>
            <p className="text-base leading-relaxed text-ink-500">
              Gerencie produtos, categorias, preços e links de checkout da loja.
            </p>
            <Link to="/admin" className={buttonStyles({ size: 'sm' })}>
              Abrir painel
            </Link>
          </aside>
        )}

        <aside aria-labelledby="account-library" className={`${CARD_CLASS} flex flex-col gap-4`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <BookOpen size={22} aria-hidden="true" />
          </span>
          <h2 id="account-library" className="text-xl font-bold text-ink-900">
            Minhas compras e biblioteca
          </h2>
          <p className="text-base leading-relaxed text-ink-500">
            Quando você adquirir um produto, ele aparecerá aqui para consulta e download.
          </p>
          <Link to="/produtos" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
            Explorar produtos
          </Link>
        </aside>
        </div>
      </div>
    </div>
  );
}
