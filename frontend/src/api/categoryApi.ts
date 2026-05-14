import apiClient from './client';
import type { Category } from '../types/category.types';

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<{ success: true; data: Category[] }>('/categories');
  return response.data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await apiClient.post<{ success: true; data: Category }>('/categories', { name });
  return response.data.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}
