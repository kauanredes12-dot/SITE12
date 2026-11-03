import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-500" role="status">
      <Loader2 className="animate-spin text-brand-600" size={28} aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white px-6 py-12 text-center shadow-soft ring-1 ring-ink-200/70" role="alert">
      <p className="font-semibold text-error-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
        {icon}
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-ink-500">{description}</p>
      {action && <div className="pt-3">{action}</div>}
    </div>
  );
}
