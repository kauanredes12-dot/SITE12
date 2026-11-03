import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { subscribeToNewsletter } from '@/services/catalog';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type FormStatus =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function NewsletterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' });

  const isSubmitting = status.kind === 'submitting';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setStatus({ kind: 'error', message: 'Informe seu nome com pelo menos 2 letras.' });
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setStatus({ kind: 'error', message: 'Informe um e-mail válido.' });
      return;
    }

    setStatus({ kind: 'submitting' });
    try {
      const result = await subscribeToNewsletter({ name: trimmedName, email: trimmedEmail });
      setStatus({
        kind: 'success',
        message:
          result === 'subscribed'
            ? 'Inscrição confirmada! Você receberá nossas novidades e ofertas.'
            : 'Este e-mail já está inscrito. Obrigado pelo interesse!',
      });
      setName('');
      setEmail('');
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível concluir sua inscrição.',
      });
    }
  };

  const inputClass =
    'h-12 w-full rounded-xl bg-white px-4 text-base text-ink-900 ring-1 ring-inset ring-ink-200 placeholder:text-ink-500 transition focus:ring-2 focus:ring-brand-500 disabled:opacity-60';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-ink-900">
          Nome
          <input
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            maxLength={120}
            placeholder="Como podemos te chamar?"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-ink-900">
          E-mail
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            maxLength={254}
            placeholder="voce@exemplo.com"
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={isSubmitting} className="sm:min-w-56">
          {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Enviando...' : 'Quero receber novidades'}
        </Button>
        {status.kind === 'success' && (
          <p role="status" className="flex items-start gap-2 text-sm font-semibold text-ink-900">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
            {status.message}
          </p>
        )}
        {status.kind === 'error' && (
          <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-error-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
