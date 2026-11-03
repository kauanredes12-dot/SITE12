import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { buttonStyles } from '@/components/ui/Button';
import type { HomeContentItem, HomeTextRole } from '@/types/homeContent';

const TEXT_STYLES: Record<HomeTextRole, { tag: 'p' | 'h2' | 'h3'; className: string }> = {
  eyebrow: { tag: 'p', className: 'text-sm font-bold uppercase tracking-[0.18em] text-brand-700' },
  title: { tag: 'h2', className: 'text-3xl font-bold text-ink-900 md:text-4xl' },
  subtitle: { tag: 'h3', className: 'text-xl font-semibold text-ink-900' },
  description: { tag: 'p', className: 'text-base leading-relaxed text-ink-500' },
  highlight: { tag: 'p', className: 'text-2xl font-semibold text-brand-800' },
  promo: { tag: 'p', className: 'w-fit rounded-full bg-brand-500 px-4 py-1.5 text-sm font-bold text-ink-900' },
  info: { tag: 'p', className: 'text-sm leading-relaxed text-ink-700' },
  note: { tag: 'p', className: 'text-xs leading-relaxed text-ink-500' },
};

export function HomeTextBlock({ role, content }: { role: HomeTextRole; content: string }) {
  const { tag: Tag, className } = TEXT_STYLES[role];
  return <Tag className={className}>{content}</Tag>;
}

export function HomeCtaButton({
  text,
  href,
  newTab,
  variant,
  preview = false,
}: {
  text: string;
  href: string;
  newTab: boolean;
  variant: 'primary' | 'secondary';
  preview?: boolean;
}) {
  const className = buttonStyles({ variant, size: 'lg' });
  const content = (
    <>
      {text}
      {variant === 'primary' && <ArrowRight size={18} aria-hidden="true" />}
    </>
  );

  if (preview) return <span className={className}>{content}</span>;
  if (newTab) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {content}
    </a>
  );
}

export function HomeCustomBlocks({ texts, buttons }: { texts: HomeContentItem[]; buttons: HomeContentItem[] }) {
  if (texts.length === 0 && buttons.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {texts.map((item) => (
        <HomeTextBlock key={item.id} role={item.published.role ?? 'description'} content={item.published.content ?? ''} />
      ))}
      {buttons.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
  );
}
