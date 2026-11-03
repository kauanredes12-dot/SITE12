import { NewsletterForm } from '@/components/store/NewsletterForm';

type NewsletterSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function NewsletterSection({ eyebrow, title, description }: NewsletterSectionProps) {
  return (
    <section id="newsletter" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="grid gap-10 rounded-3xl bg-white p-8 shadow-soft ring-1 ring-ink-200/70 md:p-12 lg:grid-cols-5 lg:gap-14">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p>}
          {title && <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>}
          {description && <p className="text-base leading-relaxed text-ink-500">{description}</p>}
        </div>
        <div className="lg:col-span-3 lg:self-center">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
