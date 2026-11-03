import { Link } from '@/lib/router';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchCategories } from '@/services/catalog';

const YEAR = new Date().getFullYear();

const FOOTER_NAV = [
  { label: 'Página inicial', to: '/' },
  { label: 'Explorar produtos', to: '/produtos' },
  { label: 'Mais vendidos', to: '/produtos?ordem=popularidade' },
  { label: 'Ofertas', to: '/produtos?promocao=1' },
  { label: 'Carrinho', to: '/carrinho' },
];

export function SiteFooter() {
  const categories = useAsyncData(fetchCategories, []);

  return (
    <footer className="mt-24 bg-ink-900 text-ink-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-5">
          <img
            src="/9770fe30-c315-4e01-a799-9403865eac5b.png"
            alt="EDVORA, Educação, Inspiração e Conhecimento"
            width={96}
            height={96}
            loading="lazy"
            className="h-24 w-24 object-contain"
          />
          <p className="max-w-xs text-sm leading-relaxed text-ink-200">
            Conteúdos digitais para aprender, evoluir e alcançar novos objetivos, com curadoria cuidadosa e
            acesso imediato.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-500">Navegação</h2>
          <ul className="flex flex-col gap-3 text-sm text-ink-200">
            {FOOTER_NAV.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition-colors hover:text-brand-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-500">Categorias</h2>
          <ul className="flex flex-col gap-3 text-sm text-ink-200">
            {categories.data?.map((category) => (
              <li key={category.id}>
                <Link to={`/produtos?categoria=${category.slug}`} className="transition-colors hover:text-brand-300">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-500">Atendimento</h2>
          <div className="flex flex-col gap-3 text-sm text-ink-200">
            <p className="leading-relaxed">
              Dúvidas sobre produtos, pagamentos ou acesso aos materiais.
            </p>
            <a
              href="mailto:edvora.suporte@gmail.com"
              className="w-fit break-all font-semibold text-brand-300 transition-colors hover:text-brand-200"
            >
              edvora.suporte@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-500/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ink-200 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {YEAR} EDVORA. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
