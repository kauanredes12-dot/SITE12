import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useRedirectWhenSignedIn } from '@/hooks/useRedirectWhenSignedIn';
import { Link, useCurrentUrl } from '@/lib/router';
import { isValidEmail } from '@/lib/validation';
import { signInWithEmail } from '@/services/auth';

const AUTH_PATHS = ['/entrar', '/cadastro', '/esqueci-senha', '/redefinir-senha'];
const GENERIC_ERROR = 'Não foi possível entrar. Tente novamente.';

function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/conta';
  if (AUTH_PATHS.some((path) => value.startsWith(path))) return '/conta';
  return value;
}

export function LoginPage() {
  useDocumentMeta('Entrar | EDVORA', 'Acesse sua conta EDVORA para ver suas compras e favoritos.');
  const url = useCurrentUrl();
  const nextPath = getSafeNextPath(url.searchParams.get('next'));
  useRedirectWhenSignedIn(nextPath);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setFormError('Informe um e-mail válido.');
      return;
    }
    if (!password) {
      setFormError('Informe sua senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(trimmedEmail, password);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : GENERIC_ERROR);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com seu e-mail e senha para continuar."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-brand-800 hover:text-brand-700">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField id="login-email" label="E-mail">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            maxLength={254}
            placeholder="voce@exemplo.com"
            className={INPUT_CLASS}
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <PasswordInput
            id="login-password"
            label="Senha"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Link to="/esqueci-senha" className="text-sm font-semibold text-brand-800 hover:text-brand-700">
              Esqueci minha senha
            </Link>
          </div>
        </div>

        {formError && <FormAlert tone="error">{formError}</FormAlert>}

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
