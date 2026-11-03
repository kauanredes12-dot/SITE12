import { Heart, Trash2 } from 'lucide-react';
import { ProductListItem } from '@/components/store/ProductListItem';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { Button, buttonStyles } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { useStore } from '@/context/StoreContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Link } from '@/lib/router';
import { fetchProductsByIds } from '@/services/catalog';

export function FavoritesPage() {
  const { favoriteIds, toggleFavorite } = useStore();
  const { data, error, isLoading, reload } = useAsyncData(() => fetchProductsByIds(favoriteIds), []);

  useDocumentMeta('Favoritos | EDVORA', 'Seus materiais favoritos da EDVORA, prontos para adicionar ao carrinho.');

  const favorites = data
    ? favoriteIds.flatMap((id) => {
        const product = data.find((item) => item.id === id);
        return product ? [product] : [];
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Favoritos</p>
        <h1 className="text-3xl font-bold md:text-4xl">Materiais que você salvou</h1>
      </header>

      {favoriteIds.length === 0 && (
        <EmptyState
          icon={<Heart size={28} aria-hidden="true" />}
          title="Nenhum favorito ainda"
          description="Toque no coração dos produtos para guardá-los aqui e decidir depois."
          action={
            <Link to="/produtos" className={buttonStyles()}>
              Explorar produtos
            </Link>
          }
        />
      )}

      {favoriteIds.length > 0 && isLoading && <LoadingState label="Carregando favoritos..." />}

      {favoriteIds.length > 0 && !isLoading && (error || !data) && (
        <ErrorState message={error ?? 'Não foi possível carregar os favoritos.'} onRetry={reload} />
      )}

      {favoriteIds.length > 0 && !isLoading && data && (
        <div className="flex flex-col gap-4">
          {favorites.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              actions={
                <>
                  <AddToCartButton productId={product.id} size="sm" fullWidth />
                  <Button variant="ghost" size="sm" fullWidth onClick={() => toggleFavorite(product.id)}>
                    <Trash2 size={16} aria-hidden="true" />
                    Remover favorito
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
