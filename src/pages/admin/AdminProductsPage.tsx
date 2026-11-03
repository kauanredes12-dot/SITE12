import { useMemo, useState, type ReactNode } from 'react';
import { Copy, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormAlert } from '@/components/ui/FormAlert';
import { buttonStyles } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { INPUT_CLASS } from '@/components/ui/FormField';
import { useAsyncData } from '@/hooks/useAsyncData';
import { formatPrice, getCurrentPriceCents, isOnSale } from '@/lib/pricing';
import { Link } from '@/lib/router';
import { fetchAdminCategories } from '@/services/adminCategories';
import {
  deleteProduct,
  duplicateProduct,
  fetchAdminProducts,
  setProductActive,
} from '@/services/adminProducts';
import type { Category, Product } from '@/types/store';

type Feedback = { tone: 'error' | 'success'; message: string };

function loadProductsPage() {
  return Promise.all([fetchAdminProducts(), fetchAdminCategories()]);
}

function ProductCover({ product }: { product: Product }) {
  if (!product.coverUrl) {
    return <div className="h-14 w-11 shrink-0 rounded-lg bg-ink-100" aria-hidden="true" />;
  }
  return <img src={product.coverUrl} alt="" className="h-14 w-11 shrink-0 rounded-lg object-cover ring-1 ring-ink-200" />;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        isActive ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-700'
      }`}
    >
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function matchesFilters(product: Product, search: string, categoryId: string): boolean {
  if (categoryId && product.category?.id !== categoryId) return false;
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return product.title.toLowerCase().includes(term) || (product.subtitle ?? '').toLowerCase().includes(term);
}

export function AdminProductsPage() {
  const { data, error, isLoading, reload } = useAsyncData(loadProductsPage, []);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(() =>
    new URLSearchParams(window.location.search).has('saved')
      ? { tone: 'success', message: 'Produto salvo com sucesso.' }
      : null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const products = useMemo(() => data?.[0] ?? [], [data]);
  const categories: Category[] = data?.[1] ?? [];
  const visible = useMemo(
    () => products.filter((product) => matchesFilters(product, search, categoryId)),
    [products, search, categoryId],
  );

  const runAction = async (id: string, action: () => Promise<void>, successMessage: string) => {
    setBusyId(id);
    setFeedback(null);
    try {
      await action();
      setFeedback({ tone: 'success', message: successMessage });
      reload();
    } catch (cause) {
      setFeedback({ tone: 'error', message: cause instanceof Error ? cause.message : 'Erro inesperado.' });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    await runAction(target.id, () => deleteProduct(target.id), `"${target.title}" foi excluído.`);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Catálogo</p>
          <h1 className="text-3xl font-bold text-ink-900">Produtos</h1>
        </div>
        <Link to="/admin/produtos/novo" className={buttonStyles({ size: 'md' })}>
          <Plus size={18} aria-hidden="true" />
          Adicionar produto
        </Link>
      </header>

      {feedback && <FormAlert tone={feedback.tone}>{feedback.message}</FormAlert>}

      {isLoading && <LoadingState label="Carregando produtos..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && products.length === 0 && (
        <EmptyState
          icon={<Plus size={28} aria-hidden="true" />}
          title="Nenhum produto cadastrado"
          description="Crie seu primeiro produto digital para começar a vender."
          action={
            <Link to="/admin/produtos/novo" className={buttonStyles({ size: 'md' })}>
              Cadastrar produto
            </Link>
          }
        />
      )}

      {data && products.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar produtos</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título"
                className={`${INPUT_CLASS} pl-11`}
              />
            </label>
            <label className="sm:w-64">
              <span className="sr-only">Filtrar por categoria</span>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={INPUT_CLASS}>
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-ink-200/70">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-xs font-bold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3">Capa</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {visible.map((product) => {
                  const isBusy = busyId === product.id;
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-4 py-3">
                        <ProductCover product={product} />
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/produtos/${product.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                          {product.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{product.category?.name ?? 'Sem categoria'}</td>
                      <td className="px-4 py-3 text-ink-900">
                        <span className="font-semibold">{formatPrice(getCurrentPriceCents(product))}</span>
                        {isOnSale(product) && (
                          <span className="block text-xs text-ink-500 line-through">{formatPrice(product.priceCents)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={product.isActive} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ActionIcon label="Editar" to={`/admin/produtos/${product.id}`} icon={<Pencil size={16} />} />
                          <ActionButton
                            label="Duplicar"
                            disabled={isBusy}
                            onClick={() => runAction(product.id, () => duplicateProduct(product), 'Cópia criada como inativa.')}
                            icon={<Copy size={16} />}
                          />
                          <ActionButton
                            label={product.isActive ? 'Desativar' : 'Ativar'}
                            disabled={isBusy}
                            onClick={() =>
                              runAction(
                                product.id,
                                () => setProductActive(product.id, !product.isActive),
                                product.isActive ? 'Produto desativado.' : 'Produto ativado.',
                              )
                            }
                            icon={<Power size={16} />}
                          />
                          <ActionButton
                            label="Excluir"
                            disabled={isBusy}
                            tone="danger"
                            onClick={() => setPendingDelete(product)}
                            icon={<Trash2 size={16} />}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visible.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-ink-500">Nenhum produto encontrado com esses filtros.</p>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir produto?"
        description={`"${pendingDelete?.title ?? ''}" será removido da loja e não poderá ser recuperado. Para apenas ocultá-lo, use Desativar.`}
        confirmLabel="Excluir definitivamente"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

const ACTION_CLASS =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-40';

function ActionIcon({ label, to, icon }: { label: string; to: string; icon: ReactNode }) {
  return (
    <Link to={to} aria-label={label} title={label} className={ACTION_CLASS}>
      {icon}
    </Link>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
  disabled,
  tone,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  disabled: boolean;
  tone?: 'danger';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`${ACTION_CLASS} ${tone === 'danger' ? 'hover:bg-error-50 hover:text-error-700' : ''}`}
    >
      {icon}
    </button>
  );
}
