import type { HomeContentItem, HomeLayout } from '@/types/homeContent';

const bySortOrder = (a: HomeContentItem, b: HomeContentItem) => a.sortOrder - b.sortOrder;

export function isLiveItem(item: HomeContentItem): boolean {
  if (item.kind === 'section') return true;
  if (item.kind === 'text') return Boolean(item.published.content?.trim());
  return Boolean(item.published.text?.trim() && item.published.href);
}

export function buildHomeLayout(items: HomeContentItem[]): HomeLayout {
  const live = items.filter((item) => item.isVisible && isLiveItem(item));

  const sections = live
    .filter((item) => item.kind === 'section')
    .sort(bySortOrder)
    .map((section) => {
      const children = live.filter((item) => item.sectionId === section.id).sort(bySortOrder);
      return {
        section,
        texts: children.filter((item) => item.kind === 'text'),
        buttons: children.filter((item) => item.kind === 'button'),
      };
    });

  const textByKey = new Map<string, string>();
  for (const item of live) {
    if (item.kind === 'text' && item.itemKey && item.published.content) {
      textByKey.set(item.itemKey, item.published.content);
    }
  }

  return { sections, textByKey };
}
