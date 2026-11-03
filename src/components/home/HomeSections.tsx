import { Fragment } from 'react';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { BrandSection } from '@/components/home/BrandSection';
import { HomeCustomBlocks } from '@/components/home/HomeBlocks';
import { HeroSection } from '@/components/home/HeroSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { ProductShelfSection } from '@/components/home/ProductShelfSection';
import { isOnSale } from '@/lib/pricing';
import type { HomeBanner } from '@/types/banners';
import type { HomeLayout, HomeSectionView } from '@/types/homeContent';
import type { Category, Product } from '@/types/store';

const SHELF_SIZE = 4;

type HomeSectionsProps = {
  layout: HomeLayout;
  categories: Category[];
  products: Product[];
  banners: HomeBanner[];
};

export function HomeSections({ layout, categories, products, banners }: HomeSectionsProps) {
  const productCounts = products.reduce<Record<string, number>>((counts, product) => {
    if (product.category) counts[product.category.id] = (counts[product.category.id] ?? 0) + 1;
    return counts;
  }, {});

  const shelves: Record<string, Product[]> = {
    bestsellers: [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, SHELF_SIZE),
    launches: products.slice(0, SHELF_SIZE),
    offers: products.filter(isOnSale).slice(0, SHELF_SIZE),
    specials: products.filter((product) => product.isFeatured).slice(0, 3),
  };

  const shelfLinks: Record<string, string> = {
    bestsellers: '/produtos?ordem=popularidade',
    launches: '/produtos?ordem=lancamentos',
    offers: '/produtos?promocao=1',
    specials: '/produtos',
  };

  const renderBuiltIn = (view: HomeSectionView, key: string) => {
    const text = (textKey: string) => layout.textByKey.get(textKey);
    const headingKey = (name: string) => ({
      eyebrow: text(`${name}.eyebrow`),
      title: text(`${name}.title`),
      description: text(`${name}.description`),
    });

    switch (key) {
      case 'hero':
        return (
          <HeroSection
            eyebrow={text('hero.eyebrow')}
            title={text('hero.title')}
            subtitle={text('hero.subtitle')}
            extraTexts={view.texts.filter((item) => !item.itemKey)}
            buttons={view.buttons}
            banners={banners}
          />
        );
      case 'categories':
        return <CategoriesSection categories={categories} productCounts={productCounts} {...headingKey('categories')} />;
      case 'benefits':
        return <BenefitsSection eyebrow={text('benefits.eyebrow')} title={text('benefits.title')} />;
      case 'brand':
        return <BrandSection {...headingKey('brand')} />;
      case 'newsletter':
        return <NewsletterSection {...headingKey('newsletter')} />;
      case 'bestsellers':
      case 'launches':
      case 'offers':
      case 'specials':
        return (
          <ProductShelfSection
            eyebrow={text(`${key}.eyebrow`)}
            title={text(`${key}.title`)}
            products={shelves[key]}
            viewAllTo={shelfLinks[key]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {layout.sections.map((view) => {
        const { section } = view;
        if (!section.itemKey) {
          if (view.texts.length === 0 && view.buttons.length === 0) return null;
          return (
            <section
              key={section.id}
              className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 md:py-20 lg:px-8"
            >
              <HomeCustomBlocks texts={view.texts} buttons={view.buttons} />
            </section>
          );
        }

        const customTexts = view.texts.filter((item) => !item.itemKey);
        const customButtons = view.buttons.filter((item) => !item.itemKey);
        const hasExtras = customTexts.length > 0 || customButtons.length > 0;

        return (
          <Fragment key={section.id}>
            {renderBuiltIn(view, section.itemKey)}
            {section.itemKey !== 'hero' && hasExtras && (
              <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 sm:px-6 lg:px-8">
                <HomeCustomBlocks texts={customTexts} buttons={customButtons} />
              </section>
            )}
          </Fragment>
        );
      })}
    </>
  );
}
