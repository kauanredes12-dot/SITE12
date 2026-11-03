import { useEffect } from 'react';
import type { Category, Product } from '@/types/store';
import { useCurrentUrl } from '@/lib/router';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchStorefront } from '@/services/catalog';
import { fetchActiveBanners } from '@/services/banners';
import type { HomeBanner } from '@/types/banners';
import { ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { HomeSections } from '@/components/home/HomeSections';
import { useHomeLayout } from '@/hooks/useHomeLayout';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

async function loadHomePage(): Promise<{ storefront: [Category[], Product[]]; banners: HomeBanner[] }> {
  const [storefront, banners] = await Promise.all([
    fetchStorefront(),
    fetchActiveBanners().catch((cause: unknown) => {
      console.error('home banners failed to load', cause);
      return [] as HomeBanner[];
    }),
  ]);
  return { storefront, banners };
}

export function HomePage() {
  useDocumentMeta(
    'EDVORA | Conhecimento que transforma possibilidades em conquistas',
    'Conheça a EDVORA: eBooks, guias digitais e materiais educativos para aprender, evoluir e alcançar novos objetivos.',
  );

  const { data, error, isLoading, reload } = useAsyncData(loadHomePage, []);
  const { layout } = useHomeLayout();
  const { hash } = useCurrentUrl();
  const isReady = !isLoading && layout !== null;

  useEffect(() => {
    if (!isReady || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
  }, [isReady, hash]);

  if (isLoading || !layout) return <LoadingState label="Carregando a EDVORA..." />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message={error ?? 'Não foi possível carregar a página.'} onRetry={reload} />
      </div>
    );
  }

  const [categories, products] = data.storefront;

  return <HomeSections layout={layout} categories={categories} products={products} banners={data.banners} />;
}
