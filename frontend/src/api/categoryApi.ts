import apiClient from './client';
import type { Category, CreateCategoryRequest } from '../types/category.types';

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<{ success: true; data: Category[] }>('/categories');
  return response.data.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const response = await apiClient.post<{ success: true; data: Category }>('/categories', data);
  return response.data.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}
