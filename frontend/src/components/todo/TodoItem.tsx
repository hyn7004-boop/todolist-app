import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToggleTodo } from '../../hooks/useToggleTodo';
import { useToastStore } from '../../stores/toastStore';
import { useLanguage } from '../../hooks/useLanguage';
import { getCategoryName } from '../../utils/categoryUtils';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';

const BADGE_STYLES = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#DCFCE7', color: '#15803D' },
  { bg: '#EDE9FE', color: '#6D28D9' },
  { bg: '#CCFBF1', color: '#0F766E' },
  { bg: '#FFE4E6', color: '#BE123C' },
  { bg: '#FEF3C7', color: '#B45309' },
];

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onDelete: (todoId: string) => void;
}

export function TodoItem({ todo, categories, onDelete }: TodoItemProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { mutate: toggle, isPending: toggling } = useToggleTodo();

  const [isCompleted, setIsCompleted] = useState(todo.is_completed);
  const prevRef = useRef(todo.is_completed);

  useEffect(() => {
    setIsCompleted(todo.is_completed);
    prevRef.current = todo.is_completed;
  }, [todo.is_completed]);

  const categoryIndex = categories.findIndex((c) => c.category_id === todo.category_id);
  const badgeStyle = BADGE_STYLES[categoryIndex % BADGE_STYLES.length] ?? { bg: '#DBEAFE', color: '#1D4ED8' };
  const foundCategory = categoryIndex >= 0 ? categories[categoryIndex] : null;
  const categoryName = foundCategory ? getCategoryName(foundCategory, currentLanguage) : '';

  const handleToggle = () => {
    const next = !isCompleted;
    setIsCompleted(next);
    toggle(todo.todo_id, {
      onError: () => {
        setIsCompleted(prevRef.current);
        useToastStore.getState().show('상태 변경에 실패했습니다.', 'error');
      },
    });
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b hover:bg-[var(--color-hover)] transition-colors rounded-md px-2" style={{ borderColor: 'var(--color-border)' }}>
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
        disabled={toggling}
        aria-label={t('todo.completeLabel', { title: todo.title })}
        className="w-[18px] h-[18px] rounded cursor-pointer flex-shrink-0"
        style={{ accentColor: '#16A34A' }}
      />

      <span
        className="flex-1 text-sm"
        style={{
          textDecoration: isCompleted ? 'line-through' : 'none',
          color: isCompleted ? '#9CA3AF' : 'var(--color-text-primary)',
        }}
      >
        {todo.title}
      </span>

      {categoryName && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{ background: badgeStyle.bg, color: badgeStyle.color }}
        >
          {categoryName}
        </span>
      )}

      <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{todo.due_date}</span>

      <button
        type="button"
        onClick={() => navigate(`/todos/${todo.todo_id}/edit`)}
        className="p-1 rounded hover:text-blue-600 hover:bg-blue-50 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label={t('common.edit')}
      >
        <Pencil size={16} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={() => onDelete(todo.todo_id)}
        className="p-1 rounded hover:text-red-600 hover:bg-red-50 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label={t('common.delete')}
      >
        <Trash2 size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
