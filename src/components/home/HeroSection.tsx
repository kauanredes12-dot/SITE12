import { HomeBannerCarousel } from '@/components/home/HomeBannerCarousel';
import { HomeCtaButton, HomeCustomBlocks } from '@/components/home/HomeBlocks';
import type { HomeBanner } from '@/types/banners';
import type { HomeContentItem } from '@/types/homeContent';

type HeroSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  extraTexts: HomeContentItem[];
  buttons: HomeContentItem[];
  banners: HomeBanner[];
};

export function HeroSection({ eyebrow, title, subtitle, extraTexts, buttons, banners }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="flex max-w-3xl animate-fade-up flex-col gap-6">
          {eyebrow && (
            <span className="inline-flex w-fit items-center rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-800">
              {eyebrow}
            </span>
          )}
          {title && <h1 className="text-4xl font-bold text-ink-900 sm:text-5xl lg:text-6xl">{title}</h1>}
          {subtitle && <p className="max-w-xl text-lg leading-relaxed text-ink-500">{subtitle}</p>}
          <HomeCustomBlocks texts={extraTexts} buttons={[]} />
          {buttons.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              {buttons.map((item) => (
                <HomeCtaButton
                  key={item.id}
                  text={item.published.text ?? ''}
                  href={item.published.href ?? '/'}
                  newTab={Boolean(item.published.newTab)}
                  variant={item.published.variant ?? 'secondary'}
                />
              ))}
            </div>
          )}
        </div>

        {banners.length > 0 && (
          <div className="animate-fade-up [animation-delay:150ms]">
            <HomeBannerCarousel banners={banners} />
          </div>
        )}
      </div>
    </section>
  );
}
