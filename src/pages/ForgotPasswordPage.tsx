import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Link } from '@/lib/router';
import { isValidEmail } from '@/lib/validation';
import { requestPasswordReset } from '@/services/auth';

const GENERIC_ERROR = 'Não foi possível enviar o link agora. Tente novamente.';

export function ForgotPasswordPage() {
  useDocumentMeta('Recuperar senha | EDVORA', 'Receba um link por e-mail para criar uma nova senha.');

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setFormError('Informe um e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(trimmedEmail);
      setIsSent(true);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha."
      footer={
        <Link to="/entrar" className="font-semibold text-brand-800 hover:text-brand-700">
          Voltar para o login
        </Link>
      }
    >
      {isSent ? (
        <FormAlert tone="success">
          <p>Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha.</p>
          <p className="font-medium text-ink-500">Confira também a caixa de spam.</p>
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField id="forgot-email" label="E-mail da conta">
            <input
              id="forgot-email"
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

          {formError && <FormAlert tone="error">{formError}</FormAlert>}

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
