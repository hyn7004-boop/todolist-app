import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '../api/todoApi';
import type { CreateTodoRequest } from '../types/todo.types';

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
