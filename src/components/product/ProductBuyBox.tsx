import { ExternalLink, Heart, Clock3, Settings } from 'lucide-react';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { ProductPrice } from '@/components/store/ProductCard';
import { buttonStyles } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { getDiscountPercent, isOnSale } from '@/lib/pricing';
import { Link } from '@/lib/router';
import type { Product } from '@/types/store';

const PLATFORM_LABEL: Record<Product['checkoutPlatform'], string> = {
  kiwify: 'Kiwify',
  cakto: 'Cakto',
};

function AdminCheckoutNotice({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-brand-50 p-4 ring-1 ring-brand-200">
      <p className="flex items-center gap-2 text-sm font-bold text-brand-800">
        <Settings size={16} aria-hidden="true" />
        Checkout não configurado (visível apenas para administradores)
      </p>
      <p className="text-sm leading-relaxed text-ink-900">
        O botão de compra só aparece para clientes quando o link da {PLATFORM_LABEL[product.checkoutPlatform]} estiver
        preenchido e habilitado no cadastro do produto.
      </p>
      <Link
        to={`/admin/produtos/${product.id}`}
        className="w-fit text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
      >
        Configurar checkout deste produto
      </Link>
    </div>
  );
}

export function ProductBuyBox({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useStore();
  const { profile } = useAuth();
  const favorite = isFavorite(product.id);
  const discount = getDiscountPercent(product);
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70 sm:p-8">
      <div className="flex flex-col gap-3">
        <ProductPrice product={product} />
        {isOnSale(product) && (
          <span className="w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
            Economize {discount}% nesta oferta
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {product.checkoutUrl ? (
          <>
            <a
              href={product.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ size: 'lg', fullWidth: true })}
            >
              Comprar agora
              <ExternalLink size={18} aria-hidden="true" />
            </a>
            <AddToCartButton productId={product.id} fullWidth />
          </>
        ) : isAdmin ? (
          <AdminCheckoutNotice product={product} />
        ) : (
          <p className="flex items-start gap-3 rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-500 ring-1 ring-ink-200">
            <Clock3 size={18} className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true" />
            Compra temporariamente indisponível. O checkout deste material está sendo atualizado, volte em breve.
          </p>
        )}
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={favorite}
          className={buttonStyles({ variant: 'ghost', fullWidth: true })}
        >
          <Heart size={18} className={favorite ? 'fill-brand-500 text-brand-600' : ''} aria-hidden="true" />
          {favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        </button>
      </div>

      {product.checkoutUrl && (
        <div className="flex flex-col gap-3 border-t border-ink-200 pt-6 text-sm leading-relaxed text-ink-500">
          <p>Material digital entregue após a confirmação do pagamento.</p>
          <p>Pagamento processado pelo checkout externo indicado neste produto.</p>
        </div>
      )}
    </div>
  );
}
