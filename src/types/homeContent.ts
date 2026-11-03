export type HomeItemKind = 'section' | 'text' | 'button';

export type HomeTextRole =
  | 'eyebrow'
  | 'title'
  | 'subtitle'
  | 'description'
  | 'highlight'
  | 'promo'
  | 'info'
  | 'note';

export type HomeButtonVariant = 'primary' | 'secondary';

export type HomeItemContent = {
  role?: HomeTextRole;
  content?: string;
  text?: string;
  href?: string;
  newTab?: boolean;
  variant?: HomeButtonVariant;
};

export type HomeContentItem = {
  id: string;
  kind: HomeItemKind;
  itemKey: string | null;
  sectionId: string | null;
  label: string;
  sortOrder: number;
  isVisible: boolean;
  published: HomeItemContent;
  draft: HomeItemContent | null;
  updatedAt: string;
};

export type HomeSectionView = {
  section: HomeContentItem;
  texts: HomeContentItem[];
  buttons: HomeContentItem[];
};

export type HomeLayout = {
  sections: HomeSectionView[];
  textByKey: ReadonlyMap<string, string>;
};
