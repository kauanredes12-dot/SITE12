import { useState, type FormEvent } from 'react';
import { BANNER_VIEWPORT_CLASS, BannerMedia } from '@/components/banners/BannerMedia';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { removeImageByUrl } from '@/services/adminStorage';
import { BANNER_BUCKET, saveBanner, validateBannerLink, type BannerPayload } from '@/services/banners';
import type { HomeBanner } from '@/types/banners';

type BannerFormDialogProps = {
  banner: HomeBanner | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
};

type BannerFormState = {
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  linkUrl: string;
  altText: string;
  displaySeconds: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<'desktop' | 'link' | 'seconds' | 'server', string>>;

const DISPLAY_MIN = 3;
const DISPLAY_MAX = 30;

function toFormState(banner: HomeBanner | null): BannerFormState {
  return {
    desktopImageUrl: banner?.desktopImageUrl ?? null,
    mobileImageUrl: banner?.mobileImageUrl ?? null,
    linkUrl: banner?.linkUrl ?? '',
    altText: banner?.altText ?? '',
    displaySeconds: String(banner?.displaySeconds ?? 6),
    isActive: banner?.isActive ?? true,
  };
}

export function BannerFormDialog({ banner, nextSortOrder, onClose, onSaved }: BannerFormDialogProps) {
  const [form, setForm] = useState<BannerFormState>(() => toFormState(banner));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const update = (patch: Partial<BannerFormState>) => setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const linkUrl = form.linkUrl.trim();
    const seconds = Number(form.displaySeconds);
    const nextErrors: FormErrors = {};

    if (!form.desktopImageUrl) nextErrors.desktop = 'Envie a imagem para computador.';
    const linkProblem = validateBannerLink(linkUrl);
    if (linkProblem) nextErrors.link = linkProblem;
    if (!Number.isInteger(seconds) || seconds < DISPLAY_MIN || seconds > DISPLAY_MAX) {
      nextErrors.seconds = `Informe um tempo entre ${DISPLAY_MIN} e ${DISPLAY_MAX} segundos.`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.desktopImageUrl) return;

    const payload: BannerPayload = {
      desktop_image_url: form.desktopImageUrl,
      mobile_image_url: form.mobileImageUrl,
      link_url: linkUrl || null,
      alt_text: form.altText.trim(),
      display_seconds: seconds,
      sort_order: banner?.sortOrder ?? nextSortOrder,
      is_active: form.isActive,
    };

    setIsSaving(true);
    try {
      await saveBanner(banner?.id ?? null, payload);
      if (banner) {
        const replaced = [banner.desktopImageUrl, banner.mobileImageUrl].filter(
          (url): url is string => Boolean(url) && url !== form.desktopImageUrl && url !== form.mobileImageUrl,
        );
        await Promise.all(replaced.map((url) => removeImageByUrl(BANNER_BUCKET, url)));
      }
      onSaved();
    } catch (cause) {
      setErrors({ server: cause instanceof Error ? cause.message : 'Erro inesperado.' });
    } finally {
      setIsSaving(false);
    }
  };

  const previewBanner = {
    desktopImageUrl: form.desktopImageUrl ?? '',
    mobileImageUrl: form.mobileImageUrl,
    altText: form.altText,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-dialog-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col gap-6 overflow-y-auto rounded-t-2xl bg-white p-6 shadow-soft sm:rounded-2xl sm:p-8"
      >
        <h2 id="banner-dialog-title" className="text-xl font-bold text-ink-900">
          {banner ? 'Editar banner' : 'Novo banner'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {errors.server && <FormAlert tone="error">{errors.server}</FormAlert>}

          <div className="flex flex-col gap-2">
            <ImageUploadField
              id="banner-desktop-image"
              label="Imagem para computador e tablet (recomendado 1600 x 600 px)"
              folder="desktop"
              bucket={BANNER_BUCKET}
              aspect="banner"
              value={form.desktopImageUrl}
              onChange={(url) => update({ desktopImageUrl: url })}
            />
            {errors.desktop && (
              <p role="alert" className="text-sm font-medium text-error-700">
                {errors.desktop}
              </p>
            )}
          </div>

          <ImageUploadField
            id="banner-mobile-image"
            label="Imagem para celular (opcional, recomendado 800 x 600 px)"
            folder="mobile"
            bucket={BANNER_BUCKET}
            aspect="mobile"
            value={form.mobileImageUrl}
            onChange={(url) => update({ mobileImageUrl: url })}
          />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-ink-900">Prévia na página inicial</p>
            <div className={`relative w-full overflow-hidden rounded-2xl bg-ink-100 ring-1 ring-ink-200 ${BANNER_VIEWPORT_CLASS}`}>
              {previewBanner.desktopImageUrl ? (
                <BannerMedia banner={previewBanner} />
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-ink-500">
                  Envie uma imagem para visualizar o banner.
                </p>
              )}
            </div>
          </div>

          <FormField id="banner-link" label="Link ao clicar (opcional)" error={errors.link}>
            <input
              id="banner-link"
              inputMode="url"
              placeholder="https://"
              value={form.linkUrl}
              onChange={(event) => update({ linkUrl: event.target.value })}
              className={INPUT_CLASS}
              aria-invalid={Boolean(errors.link)}
            />
          </FormField>

          <FormField id="banner-alt" label="Descrição para leitores de tela (opcional)">
            <input
              id="banner-alt"
              maxLength={160}
              value={form.altText}
              onChange={(event) => update({ altText: event.target.value })}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField id="banner-seconds" label="Tempo de exibição (segundos)" error={errors.seconds}>
            <input
              id="banner-seconds"
              inputMode="numeric"
              value={form.displaySeconds}
              onChange={(event) => update({ displaySeconds: event.target.value })}
              className={INPUT_CLASS}
              aria-invalid={Boolean(errors.seconds)}
            />
          </FormField>

          <label className="flex items-center justify-between gap-4 rounded-xl bg-ink-50 p-4 ring-1 ring-ink-200">
            <span className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-ink-900">Exibir na página inicial</span>
              <span className="text-xs text-ink-500">Banners desativados ficam salvos, mas ocultos para visitantes.</span>
            </span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => update({ isActive: event.target.checked })}
              className="h-5 w-5 accent-brand-600"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 disabled:opacity-60"
            >
              {isSaving ? 'Salvando...' : 'Salvar banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
