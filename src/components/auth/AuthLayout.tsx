import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/lib/router';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-brand-100 to-transparent" />
      <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-12 sm:px-6 sm:py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <Link to="/" aria-label="EDVORA, página inicial" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">{title}</h1>
            <p className="text-base leading-relaxed text-ink-500">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70 sm:p-8">{children}</div>
        {footer && <div className="text-center text-sm text-ink-500">{footer}</div>}
      </div>
    </div>
  );
}
