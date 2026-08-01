export interface CategoryLike {
  name: string;
  name_en?: string | null;
}

/**
  Returns localized category name.
  If locale is 'en' and name_en is provided, returns name_en.
  Otherwise falls back to name.
 */
export function getCategoryName(
  category: CategoryLike | null | undefined,
  locale: string,
): string {
  if (!category) return '';
  if (locale === 'en' && category.name_en) {
    return category.name_en;
  }
  return category.name;
}
