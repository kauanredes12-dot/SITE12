import { BookOpen, Heart } from 'lucide-react';
import { Link } from '@/lib/router';
import { useStore } from '@/context/StoreContext';
import { buttonStyles } from '@/components/ui/Button';
import { formatPrice, getCurrentPriceCents, getDiscountPercent, isOnSale } from '@/lib/pricing';
import type { Product } from '@/types/store';

export function ProductPrice({ product }: { product: Product }) {
  if (!isOnSale(product)) {
    return <p className="text-lg font-bold text-ink-900">{formatPrice(product.priceCents)}</p>;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <p className="text-lg font-bold text-ink-900">{formatPrice(getCurrentPriceCents(product))}</p>
      <p className="text-sm text-ink-500 line-through">{formatPrice(product.priceCents)}</p>
    </div>
  );
}

export function FavoriteButton({ productId, className = '' }: { productId: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useStore();
  const active = isFavorite(productId);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(productId)}
      aria-pressed={active}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-ink-200/70 transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
      <Heart
        size={18}
        className={active ? 'fill-brand-500 text-brand-600' : 'text-ink-900'}
        aria-hidden="true"
      />
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const discount = getDiscountPercent(product);

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link
          to={`/produtos/${product.slug}`}
          className="block overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-200/70 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lift"
          aria-label={`Ver detalhes de ${product.title}`}
        >
          <div className="aspect-[3/4] overflow-hidden bg-brand-100">
            {product.coverUrl ? (
              <img
                src={product.coverUrl}
                alt={`Capa do eBook ${product.title}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand-700">
                <BookOpen size={40} aria-hidden="true" />
              </div>
            )}
          </div>
        </Link>
        {discount > 0 && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-ink-900">
            -{discount}%
          </span>
        )}
        <FavoriteButton productId={product.id} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <p className="text-sm font-semibold text-ink-500">{product.category?.name ?? 'Produto digital'}</p>
        <h3 className="text-base font-bold leading-snug">
          <Link to={`/produtos/${product.slug}`} className="transition-colors hover:text-brand-800">
            {product.title}
          </Link>
        </h3>
        <div className="mt-auto flex flex-col gap-4 pt-2">
          <ProductPrice product={product} />
          <Link
            to={`/produtos/${product.slug}`}
            className={buttonStyles({ variant: 'secondary', size: 'sm', fullWidth: true })}
          >
            Ver produto
          </Link>
        </div>
      </div>
    </article>
  );
}
