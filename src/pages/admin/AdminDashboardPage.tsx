import { CircleDollarSign, EyeOff, Eye, Package, Plus, Tag } from 'lucide-react';
import type { ReactNode } from 'react';
import { buttonStyles } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { useAsyncData } from '@/hooks/useAsyncData';
import { Link } from '@/lib/router';
import { formatPrice } from '@/lib/pricing';
import { fetchDashboardStats } from '@/services/adminProducts';

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">{icon}</div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-ink-500">{label}</p>
        <p className="text-3xl font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, error, isLoading, reload } = useAsyncData(fetchDashboardStats, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Visão geral</p>
          <h1 className="text-3xl font-bold text-ink-900">Painel</h1>
        </div>
        <Link to="/admin/produtos/novo" className={buttonStyles({ size: 'md' })}>
          <Plus size={18} aria-hidden="true" />
          Adicionar produto
        </Link>
      </header>

      {isLoading && <LoadingState label="Carregando indicadores..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <>
          <section aria-label="Indicadores" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Package size={20} aria-hidden="true" />} label="Total de produtos" value={data.total} />
            <StatCard icon={<Eye size={20} aria-hidden="true" />} label="Ativos na loja" value={data.active} />
            <StatCard icon={<EyeOff size={20} aria-hidden="true" />} label="Inativos" value={data.inactive} />
            <StatCard icon={<Tag size={20} aria-hidden="true" />} label="Em promoção" value={data.onPromotion} />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-ink-900">Adicionados recentemente</h2>
              <Link to="/admin/produtos" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Ver todos
              </Link>
            </div>

            {data.recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CircleDollarSign size={28} className="text-ink-500" aria-hidden="true" />
                <p className="text-sm text-ink-500">Nenhum produto cadastrado ainda.</p>
              </div>
            ) : (
              <ul className="divide-y divide-ink-200">
                {data.recent.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-4 py-4">
                    <Link to={`/admin/produtos/${product.id}`} className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-semibold text-ink-900 hover:text-brand-700">{product.title}</span>
                      <span className="text-sm text-ink-500">
                        {product.category?.name ?? 'Sem categoria'} · {formatPrice(product.priceCents)}
                      </span>
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        product.isActive ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-700'
                      }`}
                    >
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
