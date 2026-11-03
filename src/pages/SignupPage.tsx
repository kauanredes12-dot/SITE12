import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useRedirectWhenSignedIn } from '@/hooks/useRedirectWhenSignedIn';
import { Link } from '@/lib/router';
import { validateSignup, type SignupErrors, type SignupValues } from '@/lib/validation';
import { signUpWithEmail } from '@/services/auth';

const EMPTY_VALUES: SignupValues = { fullName: '', email: '', password: '', confirmation: '' };
const GENERIC_ERROR = 'Não foi possível criar sua conta. Tente novamente.';

export function SignupPage() {
  useDocumentMeta('Criar conta | EDVORA', 'Crie sua conta EDVORA para acompanhar suas compras e favoritos.');
  useRedirectWhenSignedIn('/conta');

  const [values, setValues] = useState<SignupValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof SignupValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { hasSession } = await signUpWithEmail({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      if (!hasSession) setConfirmationSent(true);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputProps = { disabled: isSubmitting };

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Leve menos de um minuto e tenha acesso às suas compras, favoritos e novidades."
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/entrar" className="font-semibold text-brand-800 hover:text-brand-700">
            Entrar
          </Link>
        </>
      }
    >
      {confirmationSent ? (
        <FormAlert tone="success">
          <p>Conta criada! Enviamos um link de confirmação para {values.email.trim()}.</p>
          <Link to="/entrar" className="font-semibold text-brand-800 underline-offset-4 hover:underline">
            Ir para o login
          </Link>
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField id="signup-name" label="Nome completo" error={errors.fullName}>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={values.fullName}
              onChange={(event) => updateField('fullName')(event.target.value)}
              maxLength={120}
              aria-invalid={Boolean(errors.fullName)}
              placeholder="Como você se chama?"
              className={INPUT_CLASS}
              {...inputProps}
            />
          </FormField>

          <FormField id="signup-email" label="E-mail" error={errors.email}>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateField('email')(event.target.value)}
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              placeholder="voce@exemplo.com"
              className={INPUT_CLASS}
              {...inputProps}
            />
          </FormField>

          <div className="flex flex-col gap-3">
            <PasswordInput
              id="signup-password"
              label="Senha"
              value={values.password}
              onChange={updateField('password')}
              autoComplete="new-password"
              error={errors.password}
              disabled={isSubmitting}
            />
            <PasswordStrength password={values.password} />
          </div>

          <PasswordInput
            id="signup-confirmation"
            label="Confirme a senha"
            value={values.confirmation}
            onChange={updateField('confirmation')}
            autoComplete="new-password"
            error={errors.confirmation}
            disabled={isSubmitting}
          />

          {formError && <FormAlert tone="error">{formError}</FormAlert>}

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Criando conta...' : 'Criar minha conta'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
