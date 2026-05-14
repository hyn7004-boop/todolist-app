import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { TodoFilter } from '../components/todo/TodoFilter';
import { TodoList } from '../components/todo/TodoList';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
import { useToastStore } from '../stores/toastStore';
import type { TodoFilter as TodoFilterType } from '../types/todo.types';

export function TodoListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TodoFilterType>({});
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const toast = useToastStore((s) => s.show);

  const { data: todos = [], isPending: todosLoading } = useTodos(filters);
  const { data: categories = [] } = useCategories();
  const { mutate: deleteTodo, isPending: deleting } = useDeleteTodo();

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteTodo(deleteTargetId, {
      onSuccess: () => {
        toast(t('todo.deleteSuccess'), 'success');
        setDeleteTargetId(null);
      },
      onError: () => {
        toast(t('todo.deleteError'), 'error');
        setDeleteTargetId(null);
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('nav.todoList')}</h1>
        <Button onClick={() => navigate('/todos/new')}>
          <Plus size={18} strokeWidth={1.5} className="mr-1" />
          {t('todo.newTodo')}
        </Button>
      </div>

      <TodoFilter filters={filters} categories={categories} onChange={setFilters} />

      <TodoList
        todos={todos}
        categories={categories}
        isLoading={todosLoading}
        onDelete={setDeleteTargetId}
      />

      <Modal
        isOpen={deleteTargetId !== null}
        title={t('todo.deleteConfirmTitle')}
        message={t('todo.deleteConfirmMessage')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
        isDanger
        confirmLabel={deleting ? t('common.deleting') : t('common.delete')}
        cancelLabel={t('common.cancel')}
      />

    </div>
  );
}
