import type { HomeContentItem, HomeTextRole } from '@/types/homeContent';

const BASE_ITEM = { isVisible: true, draft: null, updatedAt: '' } as const;

function sectionItem(key: string, label: string, sortOrder: number): HomeContentItem {
  return {
    ...BASE_ITEM,
    id: `builtin-${key}`,
    kind: 'section',
    itemKey: key,
    sectionId: null,
    label,
    sortOrder,
    published: {},
  };
}

function textItem(
  sectionKey: string,
  key: string,
  label: string,
  sortOrder: number,
  role: HomeTextRole,
  content: string,
): HomeContentItem {
  return {
    ...BASE_ITEM,
    id: `builtin-${key}`,
    kind: 'text',
    itemKey: key,
    sectionId: `builtin-${sectionKey}`,
    label,
    sortOrder,
    published: { role, content },
  };
}

function buttonItem(
  sectionKey: string,
  key: string,
  label: string,
  sortOrder: number,
  text: string,
  href: string,
  variant: 'primary' | 'secondary',
): HomeContentItem {
  return {
    ...BASE_ITEM,
    id: `builtin-${key}`,
    kind: 'button',
    itemKey: key,
    sectionId: `builtin-${sectionKey}`,
    label,
    sortOrder,
    published: { text, href, newTab: false, variant },
  };
}

export const DEFAULT_HOME_ITEMS: HomeContentItem[] = [
  sectionItem('hero', 'Destaque principal', 10),
  textItem('hero', 'hero.eyebrow', 'Texto de destaque (topo)', 10, 'eyebrow', 'Plataforma de conteúdos digitais'),
  textItem(
    'hero',
    'hero.title',
    'Título principal',
    20,
    'title',
    'Conhecimento que transforma possibilidades em conquistas.',
  ),
  textItem(
    'hero',
    'hero.subtitle',
    'Texto de apresentação',
    30,
    'description',
    'A EDVORA reúne eBooks, guias digitais e materiais educativos para você aprender, evoluir e alcançar novos objetivos.',
  ),
  buttonItem('hero', 'hero.primary', 'Botão principal', 40, 'Explorar produtos', '/produtos', 'primary'),
  buttonItem('hero', 'hero.secondary', 'Botão secundário', 50, 'Conheça a EDVORA', '/#sobre', 'secondary'),

  sectionItem('categories', 'Categorias', 20),
  textItem('categories', 'categories.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Categorias'),
  textItem(
    'categories',
    'categories.title',
    'Título da seção',
    20,
    'title',
    'Encontre o conteúdo certo para cada fase',
  ),
  textItem(
    'categories',
    'categories.description',
    'Descrição da seção',
    30,
    'description',
    'Explore temas organizados para que você avance no seu ritmo, do primeiro passo à próxima conquista.',
  ),

  sectionItem('bestsellers', 'Mais vendidos', 30),
  textItem('bestsellers', 'bestsellers.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Mais vendidos'),
  textItem(
    'bestsellers',
    'bestsellers.title',
    'Título da seção',
    20,
    'title',
    'Os favoritos de quem já aprendeu com a EDVORA',
  ),

  sectionItem('launches', 'Lançamentos', 40),
  textItem('launches', 'launches.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Lançamentos'),
  textItem('launches', 'launches.title', 'Título da seção', 20, 'title', 'Novidades recém-chegadas'),

  sectionItem('offers', 'Promoções', 50),
  textItem('offers', 'offers.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Promoções'),
  textItem('offers', 'offers.title', 'Título da seção', 20, 'title', 'Ofertas por tempo especial'),

  sectionItem('specials', 'Seleção especial', 60),
  textItem('specials', 'specials.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Seleção especial'),
  textItem('specials', 'specials.title', 'Título da seção', 20, 'title', 'Escolhas da curadoria EDVORA'),

  sectionItem('benefits', 'Vantagens', 70),
  textItem('benefits', 'benefits.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Vantagens'),
  textItem('benefits', 'benefits.title', 'Título da seção', 20, 'title', 'Por que comprar na EDVORA'),

  sectionItem('brand', 'Sobre a EDVORA', 80),
  textItem('brand', 'brand.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Sobre a EDVORA'),
  textItem(
    'brand',
    'brand.title',
    'Título da seção',
    20,
    'title',
    'Transformamos conhecimento em possibilidades reais.',
  ),
  textItem(
    'brand',
    'brand.description',
    'Descrição da seção',
    30,
    'description',
    'A EDVORA nasceu para tornar o aprendizado profissional mais acessível e mais útil. Reunimos eBooks, guias digitais e materiais educativos criados por quem valoriza método, clareza e resultado. Nosso compromisso é oferecer conteúdo que você consiga aplicar de verdade, com uma experiência de compra transparente do início ao fim.',
  ),

  sectionItem('newsletter', 'Newsletter', 90),
  textItem('newsletter', 'newsletter.eyebrow', 'Título da seção (topo)', 10, 'eyebrow', 'Receba nossas novidades'),
  textItem(
    'newsletter',
    'newsletter.title',
    'Título da seção',
    20,
    'title',
    'Receba novidades e ofertas antes de todo mundo.',
  ),
  textItem(
    'newsletter',
    'newsletter.description',
    'Descrição da seção',
    30,
    'description',
    'Lançamentos, conteúdos selecionados e promoções especiais direto na sua caixa de entrada.',
  ),
];
