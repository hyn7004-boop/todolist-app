import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '../api/todoApi';
import type { UpdateTodoRequest } from '../types/todo.types';

interface UpdateTodoVariables {
  todoId: string;
  data: UpdateTodoRequest;
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ todoId, data }: UpdateTodoVariables) => updateTodo(todoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
