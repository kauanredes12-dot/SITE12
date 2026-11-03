import { useState } from 'react';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { CategoryFormDialog } from '@/components/admin/CategoryFormDialog';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { buttonStyles } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { useAsyncData } from '@/hooks/useAsyncData';
import { deleteCategory, fetchAdminCategories } from '@/services/adminCategories';
import type { Category } from '@/types/store';

type Feedback = { tone: 'error' | 'success'; message: string };

export function AdminCategoriesPage() {
  const { data: categories, error, isLoading, reload } = useAsyncData(fetchAdminCategories, []);
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleSaved = () => {
    setEditing(undefined);
    setFeedback({ tone: 'success', message: 'Categoria salva com sucesso.' });
    reload();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await deleteCategory(pendingDelete.id);
      setFeedback({ tone: 'success', message: `"${pendingDelete.name}" foi excluída.` });
      setPendingDelete(null);
      reload();
    } catch (cause) {
      setFeedback({ tone: 'error', message: cause instanceof Error ? cause.message : 'Erro inesperado.' });
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Catálogo</p>
          <h1 className="text-3xl font-bold text-ink-900">Categorias</h1>
        </div>
        <button type="button" onClick={() => setEditing(null)} className={buttonStyles({ size: 'md' })}>
          <Plus size={18} aria-hidden="true" />
          Nova categoria
        </button>
      </header>

      {feedback && <FormAlert tone={feedback.tone}>{feedback.message}</FormAlert>}
      {isLoading && <LoadingState label="Carregando categorias..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {categories && categories.length === 0 && (
        <EmptyState
          icon={<FolderTree size={28} aria-hidden="true" />}
          title="Nenhuma categoria cadastrada"
          description="Crie categorias para organizar os produtos na loja."
        />
      )}

      {categories && categories.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-ink-200/70"
            >
              {category.imageUrl ? (
                <img src={category.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <FolderTree size={22} aria-hidden="true" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{category.name}</p>
                <p className="text-xs text-ink-500">Ordem {category.sortOrder}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  aria-label={`Editar ${category.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(category)}
                  aria-label={`Excluir ${category.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-error-50 hover:text-error-700"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing !== undefined && (
        <CategoryFormDialog category={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir categoria?"
        description={`Os produtos de "${pendingDelete?.name ?? ''}" continuam na loja, mas ficam sem categoria até você escolher outra.`}
        confirmLabel="Excluir categoria"
        isBusy={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
