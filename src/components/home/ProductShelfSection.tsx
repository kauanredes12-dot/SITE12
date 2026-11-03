import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { buttonStyles } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/store/ProductGrid';
import type { Product } from '@/types/store';

type ProductShelfSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  products: Product[];
  viewAllTo: string;
};

export function ProductShelfSection({ id, eyebrow, title, description, products, viewAllTo }: ProductShelfSectionProps) {
  if (products.length === 0) return null;

  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Link to={viewAllTo} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
            Ver todos
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      />
      <ProductGrid products={products} />
    </section>
  );
}
