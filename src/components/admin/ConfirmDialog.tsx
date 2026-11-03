import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, isBusy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-6 shadow-soft sm:p-8"
      >
        <div className="flex flex-col gap-2">
          <h2 id="confirm-dialog-title" className="text-xl font-bold text-ink-900">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-ink-500">{description}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isBusy}>
            Cancelar
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-error-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-error-900 disabled:opacity-60"
          >
            {isBusy ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
