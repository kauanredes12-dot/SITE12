import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { ProductPrice } from '@/components/store/ProductCard';
import { Link } from '@/lib/router';
import type { Product } from '@/types/store';

export function ProductListItem({ product, actions }: { product: Product; actions: ReactNode }) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-ink-200/70 sm:flex-row sm:items-center sm:p-5">
      <Link
        to={`/produtos/${product.slug}`}
        className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-100 transition-transform duration-300 hover:scale-[1.02]"
        aria-label={`Ver detalhes de ${product.title}`}
      >
        {product.coverUrl ? (
          <img src={product.coverUrl} alt={`Capa do eBook ${product.title}`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <BookOpen size={28} className="text-brand-700" aria-hidden="true" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{product.category?.name ?? 'Produto digital'}</p>
        <h3 className="text-base font-bold leading-snug">
          <Link to={`/produtos/${product.slug}`} className="transition-colors hover:text-brand-800">
            {product.title}
          </Link>
        </h3>
        <ProductPrice product={product} />
      </div>

      <div className="flex flex-col gap-2 sm:w-56 sm:shrink-0">{actions}</div>
    </article>
  );
}
