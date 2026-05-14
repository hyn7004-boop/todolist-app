export interface Category {
  category_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
}
