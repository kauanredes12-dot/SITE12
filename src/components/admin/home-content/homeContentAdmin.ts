import { isLiveItem } from '@/lib/homeLayout';
import type { HomeButtonVariant, HomeContentItem, HomeTextRole } from '@/types/homeContent';

export const HOME_TEXT_ROLE_LABELS: Record<HomeTextRole, string> = {
  eyebrow: 'Rótulo acima do título',
  title: 'Título',
  subtitle: 'Subtítulo',
  description: 'Descrição',
  highlight: 'Frase de destaque',
  promo: 'Texto promocional',
  info: 'Texto informativo',
  note: 'Texto auxiliar',
};

export const BUTTON_VARIANT_LABELS: Record<HomeButtonVariant, string> = {
  primary: 'Principal (destaque)',
  secondary: 'Secundário',
};

export function getWorkingContent(item: HomeContentItem) {
  return item.draft ?? item.published;
}

export function getItemStatus(item: HomeContentItem): { label: string; className: string } {
  if (!item.isVisible) return { label: 'Oculto', className: 'bg-ink-100 text-ink-700' };
  if (item.draft) return { label: 'Rascunho pendente', className: 'bg-ink-900 text-white' };
  if (item.kind !== 'section' && !isLiveItem(item)) {
    return { label: 'Não publicado', className: 'bg-error-50 text-error-700' };
  }
  return { label: 'Publicado', className: 'bg-brand-100 text-brand-800' };
}

export function bySortOrder(a: HomeContentItem, b: HomeContentItem): number {
  return a.sortOrder - b.sortOrder;
}

export function getSiblings(items: HomeContentItem[], item: HomeContentItem): HomeContentItem[] {
  return items
    .filter((candidate) => candidate.kind === item.kind && candidate.sectionId === item.sectionId)
    .sort(bySortOrder);
}

export function getSectionName(items: HomeContentItem[], sectionId: string | null): string {
  return items.find((item) => item.kind === 'section' && item.id === sectionId)?.label ?? 'Sem seção';
}

export function getSectionTitle(items: HomeContentItem[], sectionId: string): string | null {
  const title = items.find(
    (item) => item.kind === 'text' && item.sectionId === sectionId && getWorkingContent(item).role === 'title',
  );
  return title ? (getWorkingContent(title).content ?? null) : null;
}
