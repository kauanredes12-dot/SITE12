import { BookOpen, Compass, Headphones, Layers, Lock, Mail, ShieldCheck, Sparkles, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const PILLARS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Target,
    title: 'Clareza antes de tudo',
    description:
      'Cada material é organizado em sumários objetivos que mostram, antes da compra, exatamente o que você vai aprender e em que ordem.',
  },
  {
    icon: Layers,
    title: 'Aplicação prática',
    description:
      'Exercícios, planos de ação e roteiros pensados para sair da leitura e chegar à execução no seu dia a dia.',
  },
  {
    icon: Sparkles,
    title: 'Evolução contínua',
    description:
      'Um catálogo que cresce com temas de desenvolvimento pessoal, carreira, finanças e estudos, sempre com conteúdo revisado.',
  },
];

const COMMITMENTS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Lock,
    title: 'Pagamento seguro',
    description: 'Compras finalizadas em plataformas de checkout especializadas, com seus dados protegidos.',
  },
  {
    icon: BookOpen,
    title: 'Biblioteca na sua conta',
    description: 'Os materiais que você adquirir ficam reunidos na área do cliente, sempre disponíveis para consulta.',
  },
  {
    icon: Headphones,
    title: 'Suporte humano',
    description: 'Dúvidas sobre pedidos, acesso ou conteúdo são respondidas diretamente pela nossa equipe.',
  },
];

type BrandSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function BrandSection({ eyebrow, title, description }: BrandSectionProps) {
  return (
    <section id="sobre" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-20">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <div className="flex items-start gap-4 rounded-2xl bg-brand-50/60 p-5 ring-1 ring-brand-100">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-soft">
              <Compass className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-ink-900">Nossa missão</p>
              <p className="text-sm leading-relaxed text-ink-500">
                Ajudar pessoas a aprender com profundidade e agir com segurança, reduzindo o tempo entre a dúvida e a
                decisão certa.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ul className="flex flex-col divide-y divide-ink-200 rounded-2xl bg-white px-6 shadow-soft ring-1 ring-ink-200/70">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4 py-6">
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-500">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 grid gap-6 rounded-3xl bg-ink-900 p-6 text-white sm:p-8 md:grid-cols-3 md:gap-8">
        {COMMITMENTS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/10 text-brand-200">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-ink-200">{description}</p>
          </div>
        ))}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 md:col-span-3 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2 text-sm text-ink-200">
            <ShieldCheck className="size-4 text-brand-200" aria-hidden="true" />
            Seus dados são usados apenas para acesso à sua conta e à entrega dos seus materiais.
          </p>
          <a
            href="mailto:edvora.suporte@gmail.com"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-brand-200"
          >
            <Mail className="size-4" aria-hidden="true" />
            edvora.suporte@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
