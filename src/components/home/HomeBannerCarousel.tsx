import { useEffect, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { BANNER_VIEWPORT_CLASS, BannerMedia } from '@/components/banners/BannerMedia';
import type { HomeBanner } from '@/types/banners';

const SWIPE_THRESHOLD_PX = 40;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HomeBannerCarousel({ banners }: { banners: HomeBanner[] }) {
  const [index, setIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => !prefersReducedMotion());
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const count = banners.length;
  const safeIndex = Math.min(index, count - 1);
  const current = banners[safeIndex];
  const canNavigate = count > 1;

  const goTo = (target: number) => setIndex(((target % count) + count) % count);
  const goNext = () => goTo(safeIndex + 1);
  const goPrevious = () => goTo(safeIndex - 1);

  useEffect(() => {
    if (!canNavigate || !autoplayEnabled || isPaused) return;
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % count), current.displaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [canNavigate, autoplayEnabled, isPaused, count, safeIndex, current.displaySeconds]);

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || !canNavigate) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) goNext();
    else goPrevious();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!canNavigate) return;
    if (event.key === 'ArrowRight') goNext();
    if (event.key === 'ArrowLeft') goPrevious();
  };

  const controlClass =
    'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-soft transition-all duration-200 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:flex';

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da EDVORA"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="w-full"
    >
      <div
        className={`group relative w-full overflow-hidden rounded-2xl bg-ink-100 ring-1 ring-ink-200/70 ${BANNER_VIEWPORT_CLASS}`}
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full w-full transform-gpu transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {banners.map((banner, position) => {
            const isActive = position === safeIndex;
            const media = (
              <div
                className={`h-full w-full transform-gpu transition-transform duration-[1400ms] ease-out motion-reduce:transform-none motion-reduce:transition-none ${
                  isActive ? 'scale-100' : 'scale-[1.06]'
                }`}
              >
                <BannerMedia banner={banner} priority />
              </div>
            );
            return (
              <div
                key={banner.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${position + 1} de ${count}`}
                aria-hidden={!isActive}
                className="h-full w-full shrink-0"
              >
                {isActive && banner.linkUrl ? (
                  <a href={banner.linkUrl} className="block h-full w-full" aria-label={banner.altText || 'Abrir banner'}>
                    {media}
                  </a>
                ) : (
                  media
                )}
              </div>
            );
          })}
        </div>

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Banner anterior"
              className={`${controlClass} left-4`}
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" onClick={goNext} aria-label="Próximo banner" className={`${controlClass} right-4`}>
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {canNavigate && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2" role="group" aria-label="Escolher banner">
            {banners.map((banner, position) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(position)}
                aria-label={`Ir para o banner ${position + 1}`}
                aria-current={position === safeIndex}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  position === safeIndex ? 'w-8 bg-brand-600' : 'w-2 bg-ink-200 hover:bg-ink-500'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAutoplayEnabled((enabled) => !enabled)}
            aria-label={autoplayEnabled ? 'Pausar troca automática' : 'Ativar troca automática'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-900 ring-1 ring-inset ring-ink-200 transition-colors hover:ring-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {autoplayEnabled ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  );
}
