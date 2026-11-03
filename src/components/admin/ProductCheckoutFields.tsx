import { ExternalLink } from 'lucide-react';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';
import { isValidHttpsUrl, type ProductFormErrors, type ProductFormValues } from '@/lib/productForm';
import type { CheckoutPlatform } from '@/types/store';

type ProductCheckoutFieldsProps = {
  values: ProductFormValues;
  errors: ProductFormErrors;
  onChange: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
};

const PLATFORMS: { id: CheckoutPlatform; label: string; urlKey: 'kiwifyUrl' | 'caktoUrl'; enabledKey: 'kiwifyEnabled' | 'caktoEnabled' }[] = [
  { id: 'kiwify', label: 'Kiwify', urlKey: 'kiwifyUrl', enabledKey: 'kiwifyEnabled' },
  { id: 'cakto', label: 'Cakto', urlKey: 'caktoUrl', enabledKey: 'caktoEnabled' },
];

export function ProductCheckoutFields({ values, errors, onChange }: ProductCheckoutFieldsProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-ink-900">Links de checkout</h2>
        <p className="text-sm leading-relaxed text-ink-500">
          Escolha a plataforma que vai receber o pagamento deste produto. O botão "Comprar agora" usa o link dela.
        </p>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Plataforma de checkout</legend>
        {PLATFORMS.map((platform) => {
          const isSelected = values.checkoutPlatform === platform.id;
          return (
            <label
              key={platform.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl p-4 ring-1 transition-all ${
                isSelected ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-ink-200 hover:ring-brand-500'
              }`}
            >
              <input
                type="radio"
                name="checkoutPlatform"
                value={platform.id}
                checked={isSelected}
                onChange={() => onChange('checkoutPlatform', platform.id)}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="flex flex-col">
                <span className="font-semibold text-ink-900">Usar {platform.label}</span>
                <span className="text-xs text-ink-500">{values[platform.enabledKey] ? 'Link habilitado' : 'Link desabilitado'}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
      {errors.checkoutPlatform && (
        <p role="alert" className="text-sm font-medium text-error-700">
          {errors.checkoutPlatform}
        </p>
      )}

      {PLATFORMS.map((platform) => {
        const url = values[platform.urlKey];
        const enabled = values[platform.enabledKey];
        const canTest = isValidHttpsUrl(url);
        return (
          <div key={platform.id} className="flex flex-col gap-4 rounded-xl bg-ink-50 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-semibold text-ink-900">Link da {platform.label}</span>
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink-900">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => onChange(platform.enabledKey, event.target.checked)}
                  className="h-5 w-5 accent-brand-600"
                />
                Habilitado
              </label>
            </div>
            <FormField id={platform.id} label="URL do checkout" error={errors[platform.urlKey]}>
              <input
                id={platform.id}
                type="url"
                inputMode="url"
                value={url}
                placeholder="https://pay.kiwify.com.br/..."
                onChange={(event) => onChange(platform.urlKey, event.target.value)}
                aria-invalid={Boolean(errors[platform.urlKey])}
                className={INPUT_CLASS}
              />
            </FormField>
            <div>
              <a
                href={canTest ? url.trim() : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!canTest}
                onClick={(event) => {
                  if (!canTest) event.preventDefault();
                }}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 ring-inset ring-ink-200 transition-all ${
                  canTest ? 'bg-white text-ink-900 hover:-translate-y-0.5 hover:ring-brand-500' : 'pointer-events-none text-ink-500 opacity-60'
                }`}
              >
                <ExternalLink size={16} aria-hidden="true" />
                Testar link
              </a>
            </div>
          </div>
        );
      })}
    </section>
  );
}
