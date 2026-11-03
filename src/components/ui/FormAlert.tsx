import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type FormAlertProps = {
  tone: 'error' | 'success';
  children: ReactNode;
};

export function FormAlert({ tone, children }: FormAlertProps) {
  const isError = tone === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
        isError ? 'bg-error-50 text-error-700' : 'bg-brand-100 text-ink-900'
      }`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${isError ? '' : 'text-brand-700'}`} aria-hidden="true" />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
