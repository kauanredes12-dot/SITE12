import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { updateOwnFullName } from '@/services/auth';
import type { Profile } from '@/types/auth';

type ProfileFormProps = {
  profile: Profile;
  onSaved: () => Promise<void>;
};

export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = fullName.trim();
  const isNameValid = trimmedName.length >= 2 && trimmedName.length <= 120;
  const isChanged = trimmedName !== profile.fullName;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setIsSaved(false);
    if (!isNameValid) {
      setFormError('Informe seu nome completo (de 2 a 120 letras).');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOwnFullName(profile.id, trimmedName);
      await onSaved();
      setIsSaved(true);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Não foi possível salvar seus dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField id="profile-name" label="Nome completo">
        <input
          id="profile-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={120}
          disabled={isSubmitting}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField id="profile-email" label="E-mail">
        <input
          id="profile-email"
          type="email"
          value={profile.email}
          disabled
          readOnly
          className={INPUT_CLASS}
        />
        <p className="text-sm text-ink-500">Para alterar o e-mail, entre em contato com o suporte.</p>
      </FormField>

      {formError && <FormAlert tone="error">{formError}</FormAlert>}
      {isSaved && <FormAlert tone="success">Seus dados foram salvos.</FormAlert>}

      <div>
        <Button type="submit" disabled={isSubmitting || !isChanged || !isNameValid}>
          {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
