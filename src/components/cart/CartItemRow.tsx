import { AlertTriangle, BookOpen, ExternalLink, Minus, Plus, Trash2 } from 'lucide-react';
import { ProductPrice } from '@/components/store/ProductCard';
import { buttonStyles } from '@/components/ui/Button';
import { getCheckoutOptions } from '@/lib/checkout';
import { Link } from '@/lib/router';
import type { Product } from '@/types/store';

type CartItemRowProps = {
  product: Product;
  onRemove: (productId: string) => void;
};

export function CartItemRow({ product, onRemove }: CartItemRowProps) {
  const checkoutOptions = getCheckoutOptions(product);

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-200/70">
      <div className="flex gap-4 p-5 sm:gap-5">
        <Link
          to={`/produtos/${product.slug}`}
          className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-100 sm:h-32 sm:w-24"
          aria-label={`Ver detalhes de ${product.title}`}
        >
          {product.coverUrl ? (
            <img src={product.coverUrl} alt={`Capa do eBook ${product.title}`} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <BookOpen size={28} className="text-brand-700" aria-hidden="true" />
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-base font-bold leading-snug text-ink-900">
            <Link to={`/produtos/${product.slug}`} className="transition-colors hover:text-brand-700">
              {product.title}
            </Link>
          </h3>
          {product.subtitle && <p className="text-sm text-ink-500">{product.subtitle}</p>}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <div className="inline-flex items-center rounded-lg ring-1 ring-ink-200" role="group" aria-label="Quantidade">
              <button
                type="button"
                disabled
                aria-label="Diminuir quantidade"
                className="flex h-9 w-9 items-center justify-center text-ink-500 disabled:opacity-40"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-ink-900">1</span>
              <button
                type="button"
                disabled
                aria-label="Aumentar quantidade"
                className="flex h-9 w-9 items-center justify-center text-ink-500 disabled:opacity-40"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <ProductPrice product={product} />
              <button
                type="button"
                onClick={() => onRemove(product.id)}
                aria-label={`Remover ${product.title} do carrinho`}
                title="Remover do carrinho"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-error-50 hover:text-error-700"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-ink-200 bg-ink-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Finalizar compra deste material</p>
        {checkoutOptions.length > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {checkoutOptions.map((option, index) => (
              <a
                key={option.platform}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: index === 0 ? 'primary' : 'secondary', size: 'md', fullWidth: true })}
              >
                Comprar via {option.label}
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : (
          <p className="flex items-start gap-2 text-sm font-semibold text-ink-900" role="status">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
            Este produto está temporariamente indisponível para compra.
          </p>
        )}
      </div>
    </article>
  );
}
