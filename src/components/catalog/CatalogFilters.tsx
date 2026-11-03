import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { PRICE_RANGES, SORT_OPTIONS, type CatalogFilters as Filters } from '@/lib/catalog';
import type { Category } from '@/types/store';

type CatalogFiltersProps = {
  categories: Category[];
  formats: string[];
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
};

const SELECT_CLASS =
  'h-11 w-full appearance-none rounded-xl bg-white pl-4 pr-10 text-sm font-semibold text-ink-900 ring-1 ring-inset ring-ink-200 transition focus:ring-2 focus:ring-brand-500';

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-ink-500">
      {label}
      <span className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className={SELECT_CLASS}>
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden="true" />
      </span>
    </label>
  );
}

export function CatalogFilters({ categories, formats, filters, onChange }: CatalogFiltersProps) {
  const [draftQuery, setDraftQuery] = useState(filters.query);

  useEffect(() => {
    setDraftQuery(filters.query);
  }, [filters.query]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onChange({ query: draftQuery.trim() });
  };

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? 'bg-ink-900 text-white'
        : 'bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:ring-brand-500 hover:text-brand-800'
    }`;

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-200/70 sm:p-6">
      <form onSubmit={handleSearch} role="search" className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden="true" />
        <input
          type="search"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Pesquisar por nome, tema ou palavra-chave"
          aria-label="Pesquisar produtos"
          className="h-12 w-full rounded-xl bg-ink-50 pl-11 pr-28 text-base text-ink-900 ring-1 ring-inset ring-ink-200 placeholder:text-ink-500 transition focus:bg-white focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-ink-900 transition-colors hover:bg-brand-600"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Categorias</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onChange({ categorySlug: null })} className={chipClass(!filters.categorySlug)} aria-pressed={!filters.categorySlug}>
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange({ categorySlug: category.slug })}
              className={chipClass(filters.categorySlug === category.slug)}
              aria-pressed={filters.categorySlug === category.slug}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {formats.length > 1 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Tipo de produto</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onChange({ format: null })} className={chipClass(!filters.format)} aria-pressed={!filters.format}>
              Todos
            </button>
            {formats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => onChange({ format })}
                className={chipClass(filters.format === format)}
                aria-pressed={filters.format === format}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <FilterSelect
          label="Preço"
          value={filters.priceRange}
          onChange={(value) => onChange({ priceRange: value as Filters['priceRange'] })}
        >
          {PRICE_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Ordenar por"
          value={filters.sort}
          onChange={(value) => onChange({ sort: value as Filters['sort'] })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
        <button
          type="button"
          onClick={() => onChange({ onlyPromotions: !filters.onlyPromotions })}
          aria-pressed={filters.onlyPromotions}
          className={`h-11 rounded-xl px-5 text-sm font-semibold transition-colors ${
            filters.onlyPromotions
              ? 'bg-brand-500 text-ink-900'
              : 'bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:ring-brand-500'
          }`}
        >
          Somente promoções
        </button>
      </div>
    </div>
  );
}
