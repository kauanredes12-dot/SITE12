import { useEffect, useMemo, useState } from 'react';
import { BookOpen, SearchX } from 'lucide-react';
import { CatalogFilters as CatalogFilterPanel } from '@/components/catalog/CatalogFilters';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { applyCatalogFilters, getAvailableFormats, readCatalogFilters, writeCatalogFilters, type CatalogFilters } from '@/lib/catalog';
import { navigate } from '@/lib/router';
import { fetchStorefront } from '@/services/catalog';

const PAGE_SIZE = 12;

function buildCatalogPath(filters: CatalogFilters): string {
  const query = writeCatalogFilters(filters).toString();
  return query ? `/produtos?${query}` : '/produtos';
}

export function CatalogPage({ search }: { search: string }) {
  const filters = useMemo(() => readCatalogFilters(new URLSearchParams(search)), [search]);
  const { data, error, isLoading, reload } = useAsyncData(fetchStorefront, []);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  useDocumentMeta(
    'Explorar produtos | EDVORA',
    'Pesquise, filtre e compare eBooks e guias digitais da EDVORA por categoria, preço e promoções.',
  );

  const results = useMemo(() => (data ? applyCatalogFilters(data[1], filters) : []), [data, filters]);
  const formats = useMemo(() => (data ? getAvailableFormats(data[1]) : []), [data]);

  const updateFilters = (next: Partial<CatalogFilters>) => {
    navigate(buildCatalogPath({ ...filters, ...next }), { replace: true });
  };

  const clearFilters = () => navigate('/produtos', { replace: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Catálogo</p>
        <h1 className="text-3xl font-bold md:text-4xl">Explorar produtos</h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-500">
          Encontre eBooks e guias digitais por tema, preço ou promoção.
        </p>
      </header>

      {isLoading && <LoadingState label="Carregando produtos..." />}

      {!isLoading && (error || !data) && (
        <ErrorState message={error ?? 'Não foi possível carregar os produtos.'} onRetry={reload} />
      )}

      {!isLoading && data && data[1].length === 0 && (
        <EmptyState
          icon={<BookOpen size={28} aria-hidden="true" />}
          title="Em breve novos produtos"
          description="O catálogo da EDVORA está sendo preparado. Volte em breve."
        />
      )}

      {!isLoading && data && data[1].length > 0 && (
        <div className="flex flex-col gap-8">
          <CatalogFilterPanel categories={data[0]} formats={formats} filters={filters} onChange={updateFilters} />

          <p className="text-sm font-semibold text-ink-500" aria-live="polite">
            {results.length === 1 ? '1 produto encontrado' : `${results.length} produtos encontrados`}
          </p>

          {results.length === 0 ? (
            <EmptyState
              icon={<SearchX size={28} aria-hidden="true" />}
              title="Nenhum produto encontrado"
              description="Tente outra palavra-chave ou remova alguns filtros para ver mais opções."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid products={results.slice(0, visibleCount)} />
              {visibleCount < results.length && (
                <div className="flex flex-col items-center gap-3 pt-4">
                  <p className="text-sm text-ink-500">
                    Mostrando {Math.min(visibleCount, results.length)} de {results.length} produtos
                  </p>
                  <Button variant="secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                    Carregar mais produtos
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
