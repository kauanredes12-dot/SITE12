import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { createHomeSection } from '@/services/homeContent';
import type { HomeContentItem } from '@/types/homeContent';
import { bySortOrder } from './homeContentAdmin';

type NewSectionDialogProps = {
  items: HomeContentItem[];
  onClose: () => void;
  onSaved: (message: string) => void;
};

type FormErrors = Partial<Record<'label' | 'title' | 'description' | 'server', string>>;

const TEXT_AREA_CLASS =
  'w-full rounded-xl bg-white px-4 py-3 text-base leading-relaxed text-ink-900 ring-1 ring-inset ring-ink-200 placeholder:text-ink-500 transition focus:ring-2 focus:ring-brand-500 aria-[invalid=true]:ring-error-500';

const LABEL_MAX = 80;
const TITLE_MAX = 160;
const DESCRIPTION_MAX = 500;
const SORT_STEP = 10;

export function NewSectionDialog({ items, onClose, onSaved }: NewSectionDialogProps) {
  const [label, setLabel] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const save = async (publish: boolean) => {
    const cleanLabel = label.trim();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const nextErrors: FormErrors = {};
    if (!cleanLabel) nextErrors.label = 'Informe um nome para identificar a seção no painel.';
    else if (cleanLabel.length > LABEL_MAX) nextErrors.label = `Use até ${LABEL_MAX} caracteres.`;
    if (!cleanTitle) nextErrors.title = 'Escreva o título que aparece na seção.';
    else if (cleanTitle.length > TITLE_MAX) nextErrors.title = `Use até ${TITLE_MAX} caracteres.`;
    if (cleanDescription.length > DESCRIPTION_MAX) nextErrors.description = `Use até ${DESCRIPTION_MAX} caracteres.`;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const sections = items.filter((item) => item.kind === 'section').sort(bySortOrder);
    const sortOrder = sections.reduce((max, section) => Math.max(max, section.sortOrder), 0) + SORT_STEP;

    setIsSaving(true);
    try {
      await createHomeSection({
        label: cleanLabel,
        sortOrder,
        title: { role: 'title', content: cleanTitle },
        description: cleanDescription ? { role: 'description', content: cleanDescription } : null,
        publish,
      });
      onSaved(
        publish
          ? 'Seção publicada. Ela aparece na página inicial conforme a ordem definida.'
          : 'Seção salva como rascunho. Publique os textos para exibi-la aos visitantes.',
      );
    } catch (cause) {
      setErrors({ server: cause instanceof Error ? cause.message : 'Erro inesperado.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-section-dialog-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-t-2xl bg-white p-6 shadow-soft sm:rounded-2xl sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 id="new-section-dialog-title" className="text-xl font-bold text-ink-900">
            Nova seção
          </h2>
          <p className="text-sm leading-relaxed text-ink-500">
            A nova seção entra no fim da página. Depois você pode reordená-la e adicionar textos e botões.
          </p>
        </div>

        {errors.server && <FormAlert tone="error">{errors.server}</FormAlert>}

        <FormField id="section-name" label="Nome interno (só aparece no painel)" error={errors.label}>
          <input
            id="section-name"
            maxLength={LABEL_MAX}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className={INPUT_CLASS}
            aria-invalid={Boolean(errors.label)}
          />
        </FormField>

        <FormField id="section-title" label="Título da seção" error={errors.title}>
          <input
            id="section-title"
            maxLength={TITLE_MAX}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={INPUT_CLASS}
            aria-invalid={Boolean(errors.title)}
          />
        </FormField>

        <FormField id="section-description" label="Descrição (opcional)" error={errors.description}>
          <textarea
            id="section-description"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={TEXT_AREA_CLASS}
            aria-invalid={Boolean(errors.description)}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={() => void save(false)} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar como rascunho'}
          </Button>
          <Button variant="primary" onClick={() => void save(true)} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Publicar seção'}
          </Button>
        </div>
      </div>
    </div>
  );
}
