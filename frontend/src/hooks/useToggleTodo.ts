import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo } from '../api/todoApi';

export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (todoId: string) => toggleTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
