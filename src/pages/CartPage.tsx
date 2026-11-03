import { useMemo } from 'react';
import { AlertTriangle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button, buttonStyles } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { useStore } from '@/context/StoreContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Link } from '@/lib/router';
import { fetchProductsByIds } from '@/services/catalog';

export function CartPage() {
  const { cartIds, removeFromCart, clearCart } = useStore();
  const { data, error, isLoading, reload } = useAsyncData(() => fetchProductsByIds(cartIds), []);

  useDocumentMeta('Carrinho | EDVORA', 'Revise os materiais selecionados e finalize sua compra na EDVORA.');

  const items = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.map((product) => [product.id, product]));
    return cartIds.flatMap((id) => {
      const product = byId.get(id);
      return product ? [product] : [];
    });
  }, [data, cartIds]);

  const unavailableIds = useMemo(() => {
    if (!data) return [];
    const availableIds = new Set(data.map((product) => product.id));
    return cartIds.filter((id) => !availableIds.has(id));
  }, [data, cartIds]);

  const removeUnavailable = () => unavailableIds.forEach((id) => removeFromCart(id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-8 flex items-center gap-3">
        <ShoppingCart size={32} className="text-brand-600" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-ink-900 md:text-4xl">Carrinho</h1>
      </header>

      {cartIds.length === 0 && (
        <EmptyState
          icon={<ShoppingBag size={28} aria-hidden="true" />}
          title="Seu carrinho está vazio"
          description="Explore o catálogo e adicione os materiais que quer levar para seus estudos."
          action={
            <Link to="/produtos" className={buttonStyles()}>
              Explorar produtos
            </Link>
          }
        />
      )}

      {cartIds.length > 0 && isLoading && <LoadingState label="Carregando seu carrinho..." />}

      {cartIds.length > 0 && !isLoading && (error || !data) && (
        <ErrorState message={error ?? 'Não foi possível carregar o carrinho.'} onRetry={reload} />
      )}

      {cartIds.length > 0 && !isLoading && data && (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="flex flex-col gap-4">
            {unavailableIds.length > 0 && (
              <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-200 sm:flex-row sm:items-center sm:justify-between" role="status">
                <p className="flex items-start gap-2 text-sm font-semibold text-ink-900">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
                  Alguns itens não estão mais disponíveis na loja.
                </p>
                <Button variant="secondary" size="sm" onClick={removeUnavailable}>
                  Remover indisponíveis
                </Button>
              </div>
            )}

            {items.map((product) => (
              <CartItemRow key={product.id} product={product} onRemove={removeFromCart} />
            ))}

            <button
              type="button"
              onClick={clearCart}
              className="self-start text-sm font-semibold text-ink-500 underline-offset-4 transition-colors hover:text-error-700 hover:underline"
            >
              Esvaziar carrinho
            </button>
          </div>

          <CartSummary items={items} />
        </div>
      )}
    </div>
  );
}
