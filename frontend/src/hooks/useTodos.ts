import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../api/todoApi';
import type { TodoFilter } from '../types/todo.types';

export function useTodos(filters?: TodoFilter) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => getTodos(filters),
  });
}
