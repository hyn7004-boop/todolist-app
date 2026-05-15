import type { Category } from '../types/category.types';

export function getCategoryName(category: Category, lang: string): string {
  if (lang === 'en' && category.name_en) return category.name_en;
  if (lang === 'zh' && category.name_zh) return category.name_zh;
  return category.name_ko;
}
