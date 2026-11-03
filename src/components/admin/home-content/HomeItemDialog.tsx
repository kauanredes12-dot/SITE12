import { useState } from 'react';
import { HomeCtaButton, HomeTextBlock } from '@/components/home/HomeBlocks';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import {
  createHomeItem,
  publishHomeItem,
  renameHomeItem,
  saveHomeItemDraft,
  validateHomeHref,
} from '@/services/homeContent';
import type { HomeContentItem, HomeItemContent, HomeItemKind, HomeTextRole, HomeButtonVariant } from '@/types/homeContent';
import { getWorkingContent, HOME_TEXT_ROLE_LABELS, BUTTON_VARIANT_LABELS, bySortOrder } from './homeContentAdmin';

type HomeItemDialogProps = {
  item: HomeContentItem | null;
  itemKind: HomeItemKind;
  items: HomeContentItem[];
  defaultSectionId: string | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

type FormState = {
  label: string;
  sectionId: string;
  role: HomeTextRole;
  content: string;
  text: string;
  href: string;
  newTab: boolean;
  variant: HomeButtonVariant;
};

type FormErrors = Partial<Record<'label' | 'section' | 'content' | 'text' | 'href' | 'server', string>>;

const TEXT_AREA_CLASS =
  'w-full rounded-xl bg-white px-4 py-3 text-base leading-relaxed text-ink-900 ring-1 ring-inset ring-ink-200 placeholder:text-ink-500 transition focus:ring-2 focus:ring-brand-500 disabled:bg-ink-50 disabled:text-ink-500 aria-[invalid=true]:ring-error-500';

const TEXT_MAX = 500;
const LABEL_MAX = 80;
const BUTTON_TEXT_MAX = 60;
const SORT_STEP = 10;

function toFormState(item: HomeContentItem | null, defaultSectionId: string | null): FormState {
  const working = item ? getWorkingContent(item) : {};
  return {
    label: item?.label ?? '',
    sectionId: item?.sectionId ?? defaultSectionId ?? '',
    role: working.role ?? 'description',
    content: working.content ?? '',
    text: working.text ?? '',
    href: working.href ?? '',
    newTab: working.newTab ?? false,
    variant: working.variant ?? 'secondary',
  };
}

function validate(form: FormState, itemKind: HomeItemKind): FormErrors {
  const errors: FormErrors = {};
  const label = form.label.trim();
  if (!label) errors.label = 'Informe um nome para identificar este item no painel.';
  else if (label.length > LABEL_MAX) errors.label = `Use até ${LABEL_MAX} caracteres.`;

  if (itemKind === 'section') return errors;

  if (!form.sectionId) errors.section = 'Escolha a seção onde o item aparece.';

  if (itemKind === 'text') {
    const content = form.content.trim();
    if (!content) errors.content = 'Escreva o texto que será exibido.';
    else if (content.length > TEXT_MAX) errors.content = `Use até ${TEXT_MAX} caracteres.`;
  }

  if (itemKind === 'button') {
    if (!form.text.trim()) errors.text = 'Informe o texto do botão.';
    else if (form.text.trim().length > BUTTON_TEXT_MAX) errors.text = `Use até ${BUTTON_TEXT_MAX} caracteres.`;
    const href = form.href.trim();
    if (!href) errors.href = 'Informe para onde o botão leva.';
    else {
      const problem = validateHomeHref(href);
      if (problem) errors.href = problem;
    }
  }

  return errors;
}

function buildContent(form: FormState, itemKind: HomeItemKind): HomeItemContent {
  if (itemKind === 'text') return { role: form.role, content: form.content.trim() };
  if (itemKind === 'button') {
    return { text: form.text.trim(), href: form.href.trim(), newTab: form.newTab, variant: form.variant };
  }
  return {};
}

function nextSortOrderFor(items: HomeContentItem[], itemKind: HomeItemKind, sectionId: string): number {
  const siblings = items.filter((item) => item.kind === itemKind && item.sectionId === sectionId);
  const highest = siblings.reduce((max, sibling) => Math.max(max, sibling.sortOrder), 0);
  return highest + SORT_STEP;
}

const SUCCESS_MESSAGES = {
  draft: 'Rascunho salvo. A alteração aparece para visitantes somente depois de publicada.',
  publish: 'Alteração publicada. A página inicial já mostra o novo conteúdo.',
};

export function HomeItemDialog({ item, itemKind, items, defaultSectionId, onClose, onSaved }: HomeItemDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(item, defaultSectionId));
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isBuiltIn = item?.itemKey != null;
  const isSection = itemKind === 'section';
  const sections = items.filter((candidate) => candidate.kind === 'section').sort(bySortOrder);
  const title = item ? 'Editar item' : `Novo ${itemKind === 'button' ? 'botão' : 'texto'}`;

  const update = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));

  const save = async (publish: boolean) => {
    const nextErrors = validate(form, itemKind);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const label = form.label.trim();
    const content = buildContent(form, itemKind);

    setIsSaving(true);
    try {
      if (item) {
        if (label !== item.label) await renameHomeItem(item.id, label);
        if (isSection) {
          onSaved('Nome da seção atualizado.');
          return;
        }
        if (publish) await publishHomeItem(item.id, content);
        else await saveHomeItemDraft(item.id, content);
      } else {
        await createHomeItem({
          kind: itemKind === 'button' ? 'button' : 'text',
          sectionId: form.sectionId,
          label,
          sortOrder: nextSortOrderFor(items, itemKind, form.sectionId),
          content,
          publish,
        });
      }
      onSaved(publish ? SUCCESS_MESSAGES.publish : SUCCESS_MESSAGES.draft);
    } catch (cause) {
      setErrors({ server: cause instanceof Error ? cause.message : 'Erro inesperado.' });
    } finally {
      setIsSaving(false);
    }
  };

  const previewText = form.content.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-item-dialog-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-t-2xl bg-white p-6 shadow-soft sm:rounded-2xl sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 id="home-item-dialog-title" className="text-xl font-bold text-ink-900">
            {isSection ? 'Editar nome da seção' : title}
          </h2>
          <p className="text-sm leading-relaxed text-ink-500">
            {isSection
              ? 'O nome aparece apenas no painel. Para alterar títulos e descrições, edite os textos da seção.'
              : 'Salve como rascunho para revisar depois, ou publique para a página inicial exibir a alteração.'}
          </p>
        </div>

        {errors.server && <FormAlert tone="error">{errors.server}</FormAlert>}

        <FormField id="home-item-name" label="Nome interno (só aparece no painel)" error={errors.label}>
          <input
            id="home-item-name"
            maxLength={LABEL_MAX}
            value={form.label}
            onChange={(event) => update({ label: event.target.value })}
            className={INPUT_CLASS}
            aria-invalid={Boolean(errors.label)}
          />
        </FormField>

        {!isSection && (
          <FormField id="home-item-section" label="Seção da página" error={errors.section}>
            <select
              id="home-item-section"
              value={form.sectionId}
              disabled={isBuiltIn}
              onChange={(event) => update({ sectionId: event.target.value })}
              className={INPUT_CLASS}
              aria-invalid={Boolean(errors.section)}
            >
              <option value="" disabled>
                Escolha uma seção
              </option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {itemKind === 'text' && (
          <>
            <FormField id="home-item-role" label="Tipo de texto">
              <select
                id="home-item-role"
                value={form.role}
                disabled={isBuiltIn}
                onChange={(event) => update({ role: event.target.value as HomeTextRole })}
                className={INPUT_CLASS}
              >
                {(Object.keys(HOME_TEXT_ROLE_LABELS) as HomeTextRole[]).map((role) => (
                  <option key={role} value={role}>
                    {HOME_TEXT_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="home-item-content" label="Texto exibido" error={errors.content}>
              <textarea
                id="home-item-content"
                rows={4}
                maxLength={TEXT_MAX}
                value={form.content}
                onChange={(event) => update({ content: event.target.value })}
                className={TEXT_AREA_CLASS}
                aria-invalid={Boolean(errors.content)}
              />
            </FormField>
          </>
        )}

        {itemKind === 'button' && (
          <>
            <FormField id="home-item-button-text" label="Texto do botão" error={errors.text}>
              <input
                id="home-item-button-text"
                maxLength={BUTTON_TEXT_MAX}
                value={form.text}
                onChange={(event) => update({ text: event.target.value })}
                className={INPUT_CLASS}
                aria-invalid={Boolean(errors.text)}
              />
            </FormField>
            <FormField id="home-item-href" label="Destino do botão" error={errors.href}>
              <input
                id="home-item-href"
                inputMode="url"
                placeholder="/produtos ou https://..."
                value={form.href}
                onChange={(event) => update({ href: event.target.value })}
                className={INPUT_CLASS}
                aria-invalid={Boolean(errors.href)}
              />
            </FormField>
            <FormField id="home-item-variant" label="Estilo do botão">
              <select
                id="home-item-variant"
                value={form.variant}
                onChange={(event) => update({ variant: event.target.value as HomeButtonVariant })}
                className={INPUT_CLASS}
              >
                {(Object.keys(BUTTON_VARIANT_LABELS) as HomeButtonVariant[]).map((variant) => (
                  <option key={variant} value={variant}>
                    {BUTTON_VARIANT_LABELS[variant]}
                  </option>
                ))}
              </select>
            </FormField>
            <label className="flex items-center justify-between gap-4 rounded-xl bg-ink-50 p-4 ring-1 ring-ink-200">
              <span className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-ink-900">Abrir em nova aba</span>
                <span className="text-xs text-ink-500">Desativado: o link abre na mesma janela.</span>
              </span>
              <input
                type="checkbox"
                checked={form.newTab}
                onChange={(event) => update({ newTab: event.target.checked })}
                className="h-5 w-5 accent-brand-600"
              />
            </label>
          </>
        )}

        {!isSection && showPreview && (
          <div className="flex flex-col gap-3 rounded-2xl bg-ink-50 p-5 ring-1 ring-ink-200">
            <p className="text-sm font-semibold text-ink-900">Prévia aproximada na página inicial</p>
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 ring-1 ring-ink-200/70">
              {itemKind === 'text' &&
                (previewText ? (
                  <HomeTextBlock role={form.role} content={previewText} />
                ) : (
                  <p className="text-sm text-ink-500">Escreva o texto para ver a prévia.</p>
                ))}
              {itemKind === 'button' &&
                (form.text.trim() ? (
                  <div>
                    <HomeCtaButton
                      preview
                      text={form.text.trim()}
                      href={form.href.trim()}
                      newTab={form.newTab}
                      variant={form.variant}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-ink-500">Informe o texto do botão para ver a prévia.</p>
                ))}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          {!isSection && (
            <>
              <Button variant="secondary" onClick={() => setShowPreview((visible) => !visible)} disabled={isSaving}>
                {showPreview ? 'Ocultar visualização' : 'Visualizar alteração'}
              </Button>
              <Button variant="secondary" onClick={() => void save(false)} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar como rascunho'}
              </Button>
              <Button variant="primary" onClick={() => void save(true)} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Publicar alteração'}
              </Button>
            </>
          )}
          {isSection && (
            <Button variant="primary" onClick={() => void save(false)} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar nome'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
