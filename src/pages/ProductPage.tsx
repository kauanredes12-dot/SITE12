import type { ReactNode } from 'react';
import { BookOpen, CheckCircle2, FileText, Layers } from 'lucide-react';
import { ProductBuyBox } from '@/components/product/ProductBuyBox';
import { ProductGrid } from '@/components/store/ProductGrid';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Link } from '@/lib/router';
import { fetchProductBySlug, fetchRelatedProducts } from '@/services/catalog';
import type { Product } from '@/types/store';

type ProductPageData = { product: Product; related: Product[] } | null;

async function loadProductPage(slug: string): Promise<ProductPageData> {
  const product = await fetchProductBySlug(slug);
  if (!product) return null;
  return { product, related: await fetchRelatedProducts(product) };
}

function ContentBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-12">
      <ContentBlock title="Sobre este material">
        <p className="whitespace-pre-line text-base leading-relaxed text-ink-500">{product.description}</p>
      </ContentBlock>

      {product.benefits.length > 0 && (
        <ContentBlock title="O que você vai conquistar">
          <ul className="grid gap-4 sm:grid-cols-2">
            {product.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="text-sm font-semibold leading-relaxed text-ink-900">{benefit}</span>
              </li>
            ))}
          </ul>
        </ContentBlock>
      )}

      {product.tableOfContents.length > 0 && (
        <ContentBlock title="Sumário">
          <ol className="flex flex-col divide-y divide-ink-200 rounded-2xl bg-white px-6 ring-1 ring-ink-200/70">
            {product.tableOfContents.map((chapter, index) => (
              <li key={chapter} className="flex items-center gap-4 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-800">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-ink-900">{chapter}</span>
              </li>
            ))}
          </ol>
        </ContentBlock>
      )}

      <ContentBlock title="Informações do material">
        <dl className="grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-ink-200/70 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-brand-700" aria-hidden="true" />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-ink-500">Formato</dt>
              <dd className="text-sm font-semibold text-ink-900">{product.format}</dd>
            </div>
          </div>
          {product.pages && (
            <div className="flex items-center gap-3">
              <Layers size={20} className="text-brand-700" aria-hidden="true" />
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-500">Páginas</dt>
                <dd className="text-sm font-semibold text-ink-900">{product.pages}</dd>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-brand-700" aria-hidden="true" />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-ink-500">Acesso</dt>
              <dd className="text-sm font-semibold text-ink-900">Digital, após o pagamento</dd>
            </div>
          </div>
        </dl>
      </ContentBlock>

      {product.accessInfo && (
        <ContentBlock title="Como você recebe o material">
          <p className="whitespace-pre-line rounded-2xl bg-white p-6 text-sm leading-relaxed text-ink-500 ring-1 ring-ink-200/70">
            {product.accessInfo}
          </p>
        </ContentBlock>
      )}
    </div>
  );
}

export function ProductPage({ slug }: { slug: string }) {
  const { data, error, isLoading, reload } = useAsyncData(() => loadProductPage(slug), [slug]);
  const product = data?.product;

  useDocumentMeta(
    product ? `${product.title} | EDVORA` : 'Produto | EDVORA',
    product?.subtitle ?? product?.description.slice(0, 155),
  );

  if (isLoading) return <LoadingState label="Carregando produto..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!data || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<BookOpen size={28} aria-hidden="true" />}
          title="Produto não encontrado"
          description="Este material pode ter sido removido ou o endereço está incorreto."
          action={
            <Link to="/produtos" className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">
              Ver todos os produtos
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 md:pt-14 lg:px-8">
      <nav aria-label="Caminho da página" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link to="/" className="hover:text-ink-900">Início</Link>
        <span aria-hidden="true">/</span>
        <Link to="/produtos" className="hover:text-ink-900">Produtos</Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/produtos?categoria=${product.category.slug}`} className="hover:text-ink-900">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="sticky top-8 mx-auto max-w-sm overflow-hidden rounded-3xl bg-brand-100 shadow-lift ring-1 ring-ink-200/70 lg:max-w-none">
            <div className="aspect-[3/4]">
              {product.coverUrl ? (
                <img src={product.coverUrl} alt={`Capa do eBook ${product.title}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-brand-700">
                  <BookOpen size={56} aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-7">
          <header className="flex flex-col gap-4">
            {product.category && (
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">{product.category.name}</p>
            )}
            <h1 className="text-3xl font-bold md:text-5xl">{product.title}</h1>
            {product.subtitle && <p className="text-lg leading-relaxed text-ink-500">{product.subtitle}</p>}
          </header>

          <div className="lg:max-w-md">
            <ProductBuyBox product={product} />
          </div>

          <ProductDetails product={product} />
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="mt-24 border-t border-ink-200 pt-16">
          <SectionHeading eyebrow="Continue aprendendo" title="Produtos relacionados" />
          <ProductGrid products={data.related} />
        </section>
      )}
    </div>
  );
}
