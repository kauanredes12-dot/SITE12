import { useState, type FormEvent } from 'react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import type { CategoryPayload } from '@/services/adminCategories';
import { saveCategory } from '@/services/adminCategories';
import { slugifyTitle } from '@/services/adminProducts';
import type { Category } from '@/types/store';

type CategoryFormDialogProps = {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
};

type CategoryFormState = { name: string; description: string; imageUrl: string | null; sortOrder: string };

function toFormState(category: Category | null): CategoryFormState {
  return {
    name: category?.name ?? '',
    description: category?.description ?? '',
    imageUrl: category?.imageUrl ?? null,
    sortOrder: String(category?.sortOrder ?? 0),
  };
}

export function CategoryFormDialog({ category, onClose, onSaved }: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryFormState>(() => toFormState(category));
  const [nameError, setNameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    const name = form.name.trim();
    const slug = slugifyTitle(name);
    const sortOrder = Number(form.sortOrder);

    if (name.length < 2) return setNameError('Informe um nome com pelo menos 2 caracteres.');
    if (!slug) return setNameError('Use letras ou números no nome da categoria.');
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999) {
      return setServerError('A ordem deve ser um número entre 0 e 999.');
    }
    setNameError(null);

    const payload: CategoryPayload = {
      name,
      slug,
      description: form.description.trim() || null,
      image_url: form.imageUrl,
      sort_order: sortOrder,
    };

    setIsSaving(true);
    try {
      await saveCategory(category?.id ?? null, payload);
      onSaved();
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : 'Erro inesperado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-t-2xl bg-white p-6 shadow-soft sm:rounded-2xl sm:p-8"
      >
        <h2 id="category-dialog-title" className="text-xl font-bold text-ink-900">
          {category ? 'Editar categoria' : 'Nova categoria'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {serverError && <FormAlert tone="error">{serverError}</FormAlert>}

          <ImageUploadField
            id="category-image"
            label="Imagem da categoria"
            folder="categories"
            aspect="square"
            value={form.imageUrl}
            onChange={(url) => setForm((current) => ({ ...current, imageUrl: url }))}
          />

          <FormField id="category-name" label="Nome" error={nameError ?? undefined}>
            <input
              id="category-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className={INPUT_CLASS}
              aria-invalid={Boolean(nameError)}
            />
          </FormField>

          <FormField id="category-description" label="Descrição (opcional)">
            <textarea
              id="category-description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className={`${INPUT_CLASS} h-auto min-h-[96px] py-3 leading-relaxed`}
            />
          </FormField>

          <FormField id="category-order" label="Ordem de exibição">
            <input
              id="category-order"
              inputMode="numeric"
              value={form.sortOrder}
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
              className={INPUT_CLASS}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 disabled:opacity-60"
            >
              {isSaving ? 'Salvando...' : 'Salvar categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
