import { ProductForm } from '@/components/admin/ProductForm';
import { ErrorState, LoadingState } from '@/components/ui/StatusMessage';
import { useAsyncData } from '@/hooks/useAsyncData';
import { EMPTY_PRODUCT_FORM, productToForm } from '@/lib/productForm';
import { Link } from '@/lib/router';
import { fetchAdminCategories } from '@/services/adminCategories';
import { fetchAdminProduct } from '@/services/adminProducts';

type AdminProductEditPageProps = {
  productId?: string;
};

export function AdminProductEditPage({ productId }: AdminProductEditPageProps) {
  const { data, error, isLoading, reload } = useAsyncData(
    async () => {
      const [categories, product] = await Promise.all([
        fetchAdminCategories(),
        productId ? fetchAdminProduct(productId) : Promise.resolve(null),
      ]);
      if (productId && !product) throw new Error('Produto não encontrado.');
      return { categories, product };
    },
    [productId],
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-1">
        <Link to="/admin/produtos" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Voltar para produtos
        </Link>
        <h1 className="text-3xl font-bold text-ink-900">{productId ? 'Editar produto' : 'Novo produto'}</h1>
      </header>

      {isLoading && <LoadingState label="Carregando produto..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <ProductForm
          key={data.product?.id ?? 'new'}
          productId={productId ?? null}
          initialValues={data.product ? productToForm(data.product) : EMPTY_PRODUCT_FORM}
          categories={data.categories}
        />
      )}
    </div>
  );
}
