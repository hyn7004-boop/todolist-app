import { useQuery } from '@tanstack/react-query';
import { getTodo } from '../api/todoApi';

export function useTodo(todoId: string) {
  return useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => getTodo(todoId),
    enabled: !!todoId,
  });
}
