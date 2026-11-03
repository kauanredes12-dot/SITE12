import { BadgeCheck, Download, LifeBuoy, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const BENEFITS = [
  {
    icon: Download,
    title: 'Acesso digital',
    description: 'Seus materiais ficam disponíveis para leitura e download na sua conta após a confirmação do pagamento.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    description: 'Pagamentos processados por plataformas de checkout reconhecidas, com liberação verificada pelo sistema.',
  },
  {
    icon: BadgeCheck,
    title: 'Curadoria cuidadosa',
    description: 'Cada eBook é escolhido por clareza, aplicação prática e profundidade no tema.',
  },
  {
    icon: LifeBuoy,
    title: 'Atendimento próximo',
    description: 'Dúvidas sobre um produto ou sobre o seu acesso são tratadas com atenção e agilidade.',
  },
];

type BenefitsSectionProps = {
  eyebrow?: string;
  title?: string;
};

export function BenefitsSection({ eyebrow, title }: BenefitsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <article key={title} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200/70">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm leading-relaxed text-ink-500">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
