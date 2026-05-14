import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  isLoading: boolean;
  onDelete: (todoId: string) => void;
}

export function TodoList({ todos, categories, isLoading, onDelete }: TodoListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">{t('todo.emptyState')}</p>
      </div>
    );
  }

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem
          key={todo.todo_id}
          todo={todo}
          categories={categories}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
