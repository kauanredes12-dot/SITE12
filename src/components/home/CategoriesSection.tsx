import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Category } from '@/types/store';

type CategoriesSectionProps = {
  categories: Category[];
  productCounts: Record<string, number>;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function CategoriesSection({ categories, productCounts, eyebrow, title, description }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section id="categorias" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = productCounts[category.id] ?? 0;
          return (
            <Link
              key={category.id}
              to={`/produtos?categoria=${category.slug}`}
              className="group flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-300"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-ink-900">{category.name}</h3>
                <ArrowRight
                  size={20}
                  className="mt-1 shrink-0 text-ink-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-700"
                  aria-hidden="true"
                />
              </div>
              {category.description && <p className="text-sm leading-relaxed text-ink-500">{category.description}</p>}
              <p className="mt-auto text-sm font-semibold text-brand-800">
                {count === 1 ? '1 produto' : `${count} produtos`}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
