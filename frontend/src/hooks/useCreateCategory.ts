import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/categoryApi';
import type { CreateCategoryRequest } from '../types/category.types';

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
