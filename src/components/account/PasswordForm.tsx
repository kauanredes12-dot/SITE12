import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { validateNewPassword, type PasswordErrors } from '@/lib/validation';
import { updateAccountPassword, verifyCurrentPassword } from '@/services/auth';

type PasswordFormProps = {
  email: string;
};

type PasswordFormValues = {
  current: string;
  password: string;
  confirmation: string;
};

const EMPTY_VALUES: PasswordFormValues = { current: '', password: '', confirmation: '' };

export function PasswordForm({ email }: PasswordFormProps) {
  const [values, setValues] = useState<PasswordFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<PasswordErrors & { current?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof PasswordFormValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setIsSaved(false);

    const nextErrors: PasswordErrors & { current?: string } = validateNewPassword(
      values.password,
      values.confirmation,
    );
    if (!values.current) nextErrors.current = 'Informe sua senha atual.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await verifyCurrentPassword(email, values.current);
      await updateAccountPassword(values.password);
      setValues(EMPTY_VALUES);
      setIsSaved(true);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível alterar a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <PasswordInput
        id="account-current-password"
        label="Senha atual"
        value={values.current}
        onChange={updateField('current')}
        autoComplete="current-password"
        error={errors.current}
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-3">
        <PasswordInput
          id="account-new-password"
          label="Nova senha"
          value={values.password}
          onChange={updateField('password')}
          autoComplete="new-password"
          error={errors.password}
          disabled={isSubmitting}
        />
        <PasswordStrength password={values.password} />
      </div>

      <PasswordInput
        id="account-confirm-password"
        label="Confirme a nova senha"
        value={values.confirmation}
        onChange={updateField('confirmation')}
        autoComplete="new-password"
        error={errors.confirmation}
        disabled={isSubmitting}
      />

      {formError && <FormAlert tone="error">{formError}</FormAlert>}
      {isSaved && <FormAlert tone="success">Senha alterada com sucesso.</FormAlert>}

      <div>
        <Button type="submit" variant="secondary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </div>
    </form>
  );
}
