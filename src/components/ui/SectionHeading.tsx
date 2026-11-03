import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-2xl flex-col gap-3">
        {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p>}
        {title && <h2 className="text-3xl font-bold text-ink-900 md:text-4xl">{title}</h2>}
        {description && <p className="text-base leading-relaxed text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
