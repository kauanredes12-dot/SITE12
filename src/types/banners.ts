export type HomeBanner = {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  altText: string;
  displaySeconds: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
