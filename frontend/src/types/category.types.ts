export interface Category {
  category_id: string;
  name_ko: string;
  name_en: string | null;
  name_zh: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name_ko: string;
  name_en: string;
  name_zh: string;
}
