import type { HomeBanner } from '@/types/banners';

export const BANNER_VIEWPORT_CLASS = 'aspect-[4/3] sm:aspect-[2/1] lg:aspect-[16/6]';

type BannerMediaProps = {
  banner: Pick<HomeBanner, 'desktopImageUrl' | 'mobileImageUrl' | 'altText'>;
  priority?: boolean;
};

export function BannerMedia({ banner, priority = false }: BannerMediaProps) {
  const fit = banner.mobileImageUrl ? 'object-cover' : 'object-contain sm:object-cover';
  const image = (
    <img
      src={banner.desktopImageUrl}
      alt={banner.altText || 'Banner promocional da EDVORA'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={`h-full w-full ${fit}`}
    />
  );

  if (!banner.mobileImageUrl) return image;

  return (
    <picture className="block h-full w-full">
      <source media="(max-width: 639px)" srcSet={banner.mobileImageUrl} />
      {image}
    </picture>
  );
}
