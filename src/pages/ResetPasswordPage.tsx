import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button, buttonStyles } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { useAuth } from '@/context/AuthContext';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Link } from '@/lib/router';
import { validateNewPassword, type PasswordErrors } from '@/lib/validation';
import { updateAccountPassword } from '@/services/auth';

export function ResetPasswordPage() {
  useDocumentMeta('Nova senha | EDVORA', 'Crie uma nova senha para sua conta EDVORA.');
  const { user, isLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateNewPassword(password, confirmation);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await updateAccountPassword(password);
      setIsDone(true);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar a nova senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Nova senha" subtitle="Verificando seu link...">
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-brand-600" size={28} aria-hidden="true" />
        </div>
      </AuthLayout>
    );
  }

  if (!user && !isDone) {
    return (
      <AuthLayout
        title="Link inválido"
        subtitle="Este link de recuperação não é válido ou já expirou."
        footer={
          <Link to="/esqueci-senha" className="font-semibold text-brand-800 hover:text-brand-700">
            Solicitar um novo link
          </Link>
        }
      >
        <FormAlert tone="error">Solicite um novo link para criar sua senha.</FormAlert>
      </AuthLayout>
    );
  }

  if (isDone) {
    return (
      <AuthLayout title="Senha atualizada" subtitle="Sua nova senha já está valendo.">
        <div className="flex flex-col gap-5">
          <FormAlert tone="success">Você já pode usar sua nova senha nos próximos acessos.</FormAlert>
          <Link to="/conta" className={buttonStyles({ size: 'lg', fullWidth: true })}>
            Ir para minha conta
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crie uma nova senha" subtitle="Escolha uma senha forte que você ainda não tenha usado.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <PasswordInput
            id="reset-password"
            label="Nova senha"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            error={errors.password}
            disabled={isSubmitting}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          id="reset-confirmation"
          label="Confirme a nova senha"
          value={confirmation}
          onChange={setConfirmation}
          autoComplete="new-password"
          error={errors.confirmation}
          disabled={isSubmitting}
        />

        {formError && <FormAlert tone="error">{formError}</FormAlert>}

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthLayout>
  );
}
