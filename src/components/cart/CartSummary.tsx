import { formatPrice, getCurrentPriceCents, getDiscountCents } from '@/lib/pricing';
import { Link } from '@/lib/router';
import type { Product } from '@/types/store';

export function CartSummary({ items }: { items: Product[] }) {
  const subtotal = items.reduce((sum, product) => sum + product.priceCents, 0);
  const discount = items.reduce((sum, product) => sum + getDiscountCents(product), 0);
  const total = items.reduce((sum, product) => sum + getCurrentPriceCents(product), 0);

  return (
    <aside className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70 lg:sticky lg:top-8">
      <h2 className="text-xl font-bold text-ink-900">Resumo</h2>

      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Itens</dt>
          <dd className="font-semibold text-ink-900">{items.length}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Subtotal</dt>
          <dd className="font-semibold text-ink-900">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Desconto</dt>
          <dd className="font-semibold text-brand-700">{discount > 0 ? `- ${formatPrice(discount)}` : '—'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-ink-200 pt-4">
          <dt className="text-base font-bold text-ink-900">Total</dt>
          <dd className="text-2xl font-bold text-ink-900">{formatPrice(total)}</dd>
        </div>
      </dl>

      <section aria-labelledby="cart-how-to-finish" className="flex flex-col gap-2 rounded-xl bg-ink-50 p-4 ring-1 ring-ink-200/70">
        <h3 id="cart-how-to-finish" className="text-sm font-bold text-ink-900">
          Como finalizar
        </h3>
        <p className="text-sm leading-relaxed text-ink-500">
          A compra é feita diretamente na plataforma indicada em cada material, Kiwify ou Cakto. Use os botões de cada
          item para concluir o pagamento com segurança.
        </p>
      </section>

      <Link to="/produtos" className="text-center text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 hover:underline">
        Continuar comprando
      </Link>
    </aside>
  );
}
