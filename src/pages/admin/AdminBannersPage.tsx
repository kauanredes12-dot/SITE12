import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { BannerFormDialog } from '@/components/admin/BannerFormDialog';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { BannerMedia } from '@/components/banners/BannerMedia';
import { buttonStyles } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { useAsyncData } from '@/hooks/useAsyncData';
import { removeImageByUrl } from '@/services/adminStorage';
import {
  BANNER_BUCKET,
  deleteBanner,
  fetchAdminBanners,
  saveBannerOrder,
  setBannerActive,
} from '@/services/banners';
import type { HomeBanner } from '@/types/banners';

type Feedback = { tone: 'error' | 'success'; message: string };

const ICON_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-40 disabled:hover:bg-transparent';

export function AdminBannersPage() {
  const { data: banners, error, isLoading, reload } = useAsyncData(fetchAdminBanners, []);
  const [editing, setEditing] = useState<HomeBanner | null | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<HomeBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setFeedback(null);
    try {
      await action();
      setFeedback({ tone: 'success', message: successMessage });
      reload();
    } catch (cause) {
      setFeedback({ tone: 'error', message: cause instanceof Error ? cause.message : 'Erro inesperado.' });
    }
  };

  const handleSaved = () => {
    setEditing(undefined);
    setFeedback({ tone: 'success', message: 'Banner salvo. A página inicial já mostra as alterações.' });
    reload();
  };

  const move = (index: number, direction: -1 | 1) => {
    if (!banners) return;
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const ids = banners.map((banner) => banner.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusyId(banners[index].id);
    void run(() => saveBannerOrder(ids), 'Ordem atualizada.').finally(() => setBusyId(null));
  };

  const toggleActive = (banner: HomeBanner) => {
    setBusyId(banner.id);
    void run(
      () => setBannerActive(banner.id, !banner.isActive),
      banner.isActive ? 'Banner ocultado da página inicial.' : 'Banner publicado na página inicial.',
    ).finally(() => setBusyId(null));
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await deleteBanner(target.id);
      await Promise.all(
        [target.desktopImageUrl, target.mobileImageUrl]
          .filter((url): url is string => Boolean(url))
          .map((url) => removeImageByUrl(BANNER_BUCKET, url)),
      );
      setFeedback({ tone: 'success', message: 'Banner excluído.' });
      setPendingDelete(null);
      reload();
    } catch (cause) {
      setFeedback({ tone: 'error', message: cause instanceof Error ? cause.message : 'Erro inesperado.' });
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const nextSortOrder = banners && banners.length > 0 ? Math.max(...banners.map((banner) => banner.sortOrder)) + 1 : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Página inicial</p>
          <h1 className="text-3xl font-bold text-ink-900">Gerenciar banners</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-500">
            Os banners ativos aparecem em carrossel logo abaixo do cabeçalho, na ordem listada aqui.
          </p>
        </div>
        <button type="button" onClick={() => setEditing(null)} className={buttonStyles({ size: 'md' })}>
          <Plus size={18} aria-hidden="true" />
          Novo banner
        </button>
      </header>

      {feedback && <FormAlert tone={feedback.tone}>{feedback.message}</FormAlert>}
      {isLoading && <LoadingState label="Carregando banners..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {banners && banners.length === 0 && (
        <EmptyState
          icon={<ImageIcon size={28} aria-hidden="true" />}
          title="Nenhum banner cadastrado"
          description="Envie sua primeira imagem para destacar uma promoção ou novidade na página inicial."
          action={
            <button type="button" onClick={() => setEditing(null)} className={buttonStyles({ size: 'md' })}>
              <Plus size={18} aria-hidden="true" />
              Adicionar banner
            </button>
          }
        />
      )}

      {banners && banners.length > 0 && (
        <ol className="flex flex-col gap-4">
          {banners.map((banner, index) => {
            const isBusy = busyId === banner.id;
            return (
              <li
                key={banner.id}
                className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-ink-200/70 sm:flex-row sm:items-center"
              >
                <div className="relative aspect-[16/6] w-full overflow-hidden rounded-xl bg-ink-100 sm:w-56 sm:shrink-0">
                  <BannerMedia banner={banner} />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">
                      Posição {index + 1}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        banner.isActive ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {banner.isActive ? 'Publicado' : 'Oculto'}
                    </span>
                    {banner.mobileImageUrl && (
                      <span className="rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold text-ink-900 ring-1 ring-ink-200">
                        Versão para celular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-500">Exibido por {banner.displaySeconds} segundos</p>
                  {banner.linkUrl ? (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-1.5 truncate text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      <span className="truncate">{banner.linkUrl}</span>
                    </a>
                  ) : (
                    <p className="text-sm text-ink-500">Sem link (banner apenas visual)</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-ink-200 pt-3 sm:flex-col sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || isBusy}
                      aria-label="Mover para cima"
                      className={ICON_BUTTON}
                    >
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === banners.length - 1 || isBusy}
                      aria-label="Mover para baixo"
                      className={ICON_BUTTON}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => toggleActive(banner)}
                      disabled={isBusy}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-ink-900 ring-1 ring-inset ring-ink-200 transition-colors hover:ring-brand-500 disabled:opacity-40"
                    >
                      {banner.isActive ? 'Ocultar' : 'Publicar'}
                    </button>
                    <button type="button" onClick={() => setEditing(banner)} aria-label="Editar banner" className={ICON_BUTTON}>
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(banner)}
                      aria-label="Excluir banner"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-error-50 hover:text-error-700"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {editing !== undefined && (
        <BannerFormDialog
          banner={editing}
          nextSortOrder={nextSortOrder}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir banner?"
        description="O banner será removido do carrossel e suas imagens serão apagadas. Esta ação não pode ser desfeita."
        confirmLabel="Excluir banner"
        isBusy={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
