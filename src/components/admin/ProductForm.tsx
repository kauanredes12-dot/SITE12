import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Save } from 'lucide-react';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { ProductCheckoutFields } from '@/components/admin/ProductCheckoutFields';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { formToPayload, validateProductForm, type ProductFormErrors, type ProductFormValues } from '@/lib/productForm';
import { Link, navigate } from '@/lib/router';
import { createProduct, updateProduct } from '@/services/adminProducts';
import type { Category } from '@/types/store';

type ProductFormProps = {
  productId: string | null;
  initialValues: ProductFormValues;
  categories: Category[];
};

const TEXTAREA_CLASS = `${INPUT_CLASS} h-auto min-h-[112px] py-3 leading-relaxed`;

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        {description && <p className="text-sm leading-relaxed text-ink-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-ink-50 px-4 py-3">
      <span className="text-sm font-semibold text-ink-900">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-brand-600" />
    </label>
  );
}

export function ProductForm({ productId, initialValues, categories }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const submittingRef = useRef(false);

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setServerError(null);
    const nextErrors = validateProductForm(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    submittingRef.current = true;
    setIsSaving(true);
    try {
      const payload = formToPayload(values);
      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload.title, payload);
      }
      navigate('/admin/produtos?saved=1');
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : 'Erro inesperado.');
      setIsSaving(false);
      submittingRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {serverError && <FormAlert tone="error">{serverError}</FormAlert>}

      <Section title="Informações principais" description="É isso que o cliente vê na vitrine e na página do produto.">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <ImageUploadField
            id="product-cover"
            label="Capa do produto"
            folder="products"
            value={values.coverUrl}
            onChange={(url) => update('coverUrl', url)}
          />
          <div className="flex flex-col gap-5">
            <FormField id="title" label="Título" error={errors.title}>
              <input id="title" value={values.title} onChange={(e) => update('title', e.target.value)} className={INPUT_CLASS} aria-invalid={Boolean(errors.title)} />
            </FormField>
            <FormField id="subtitle" label="Subtítulo (opcional)">
              <input id="subtitle" value={values.subtitle} onChange={(e) => update('subtitle', e.target.value)} className={INPUT_CLASS} />
            </FormField>
            <FormField id="category" label="Categoria" error={errors.categoryId}>
              <select id="category" value={values.categoryId} onChange={(e) => update('categoryId', e.target.value)} className={INPUT_CLASS} aria-invalid={Boolean(errors.categoryId)}>
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-sm text-ink-500">
                  Você ainda não tem categorias.{' '}
                  <Link to="/admin/categorias" className="font-semibold text-brand-700 hover:text-brand-800">
                    Criar categoria
                  </Link>
                </p>
              )}
            </FormField>
          </div>
        </div>
        <FormField id="description" label="Descrição" error={errors.description}>
          <textarea id="description" value={values.description} onChange={(e) => update('description', e.target.value)} className={TEXTAREA_CLASS} aria-invalid={Boolean(errors.description)} />
        </FormField>
      </Section>

      <Section title="Preço e promoção">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="price" label="Preço original (R$)" error={errors.price}>
            <input id="price" inputMode="decimal" placeholder="29,90" value={values.price} onChange={(e) => update('price', e.target.value)} className={INPUT_CLASS} aria-invalid={Boolean(errors.price)} />
          </FormField>
          <FormField id="promoPrice" label="Preço promocional (R$, opcional)" error={errors.promoPrice}>
            <input id="promoPrice" inputMode="decimal" placeholder="19,90" value={values.promoPrice} onChange={(e) => update('promoPrice', e.target.value)} className={INPUT_CLASS} aria-invalid={Boolean(errors.promoPrice)} />
          </FormField>
        </div>
        <p className="text-sm text-ink-500">Deixe o preço promocional em branco para vender pelo preço original.</p>
      </Section>

      <Section title="Conteúdo do material" description="Escreva um item por linha nos campos de lista.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="benefits" label="Benefícios">
            <textarea id="benefits" value={values.benefits} onChange={(e) => update('benefits', e.target.value)} className={TEXTAREA_CLASS} />
          </FormField>
          <FormField id="tableOfContents" label="Sumário">
            <textarea id="tableOfContents" value={values.tableOfContents} onChange={(e) => update('tableOfContents', e.target.value)} className={TEXTAREA_CLASS} />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField id="format" label="Formato">
            <input id="format" value={values.format} onChange={(e) => update('format', e.target.value)} className={INPUT_CLASS} placeholder="PDF" />
          </FormField>
          <FormField id="pages" label="Número de páginas" error={errors.pages}>
            <input id="pages" inputMode="numeric" value={values.pages} onChange={(e) => update('pages', e.target.value)} className={INPUT_CLASS} aria-invalid={Boolean(errors.pages)} />
          </FormField>
        </div>
        <FormField id="accessInfo" label="Informações sobre o acesso digital">
          <textarea id="accessInfo" value={values.accessInfo} onChange={(e) => update('accessInfo', e.target.value)} className={TEXTAREA_CLASS} placeholder="Ex.: o link de download chega por e-mail logo após a confirmação do pagamento." />
        </FormField>
      </Section>

      <Section title="Exibição na loja">
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle label="Produto ativo (visível na loja)" checked={values.isActive} onChange={(v) => update('isActive', v)} />
          <Toggle label="Destaque na vitrine" checked={values.isFeatured} onChange={(v) => update('isFeatured', v)} />
          <Toggle label="Mais vendido" checked={values.isBestseller} onChange={(v) => update('isBestseller', v)} />
        </div>
      </Section>

      <Section title="Checkout">
        <ProductCheckoutFields values={values} errors={errors} onChange={update} />
      </Section>

      <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-ink-200 bg-ink-50/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => navigate('/admin/produtos')} disabled={isSaving}>
          Cancelar
        </Button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 disabled:opacity-60"
        >
          <Save size={18} aria-hidden="true" />
          {isSaving ? 'Salvando...' : 'Salvar produto'}
        </button>
      </div>
    </form>
  );
}
