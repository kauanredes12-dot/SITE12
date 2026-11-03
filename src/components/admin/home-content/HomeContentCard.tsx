import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

type HomeContentCardProps = {
  name: string;
  location: string;
  preview: string;
  status: { label: string; className: string };
  isOriginal: boolean;
  isVisible: boolean;
  isBusy: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete?: () => void;
};

const ICON_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-40 disabled:hover:bg-transparent';

export function HomeContentCard({
  name,
  location,
  preview,
  status,
  isOriginal,
  isVisible,
  isBusy,
  canMoveUp,
  canMoveDown,
  onEdit,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
}: HomeContentCardProps) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-200/70 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
          {isOriginal && (
            <span className="rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold text-ink-700 ring-1 ring-ink-200">
              Conteúdo original
            </span>
          )}
          <span className="text-xs font-medium text-ink-500">{location}</span>
        </div>
        <h3 className="truncate text-base font-bold text-ink-900">{name}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-700">{preview}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-ink-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div className="flex gap-1">
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp || isBusy} aria-label="Mover para cima" className={ICON_BUTTON}>
            <ArrowUp size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown || isBusy} aria-label="Mover para baixo" className={ICON_BUTTON}>
            <ArrowDown size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onToggleVisibility}
            disabled={isBusy}
            aria-label={isVisible ? 'Ocultar' : 'Exibir'}
            title={isVisible ? 'Ocultar' : 'Exibir'}
            className={ICON_BUTTON}
          >
            {isVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
          <button type="button" onClick={onEdit} disabled={isBusy} aria-label="Editar" className={ICON_BUTTON}>
            <Pencil size={16} aria-hidden="true" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isBusy}
              aria-label="Excluir"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-error-50 hover:text-error-700 disabled:opacity-40"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
