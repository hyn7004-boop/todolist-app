import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { TodoForm } from '../components/todo/TodoForm';
import { useTodo } from '../hooks/useTodo';
import { useUpdateTodo } from '../hooks/useUpdateTodo';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToastStore } from '../stores/toastStore';
import { ERROR_CODES } from '../constants/errorCodes';
import type { CreateTodoRequest } from '../types/todo.types';

export default function TodoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: todo, isLoading, isError } = useTodo(id ?? '');
  const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodo();
  const [serverError, setServerError] = useState('');
  const handledRef = useRef(false);

  useEffect(() => {
    if (isError && !handledRef.current) {
      handledRef.current = true;
      useToastStore.getState().show(t('todo.notFound'), 'error');
      navigate('/todos');
    }
  }, [isError, navigate, t]);

  useEffect(() => {
    if (todo?.is_completed && !handledRef.current) {
      handledRef.current = true;
      useToastStore.getState().show(t('todo.alreadyCompleted'), 'error');
      navigate('/todos');
    }
  }, [todo, navigate, t]);

  const handleSubmit = (data: CreateTodoRequest) => {
    if (!id) return;
    setServerError('');
    updateTodo(
      { todoId: id, data },
      {
        onSuccess: () => {
          navigate('/todos');
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            const code = error.response?.data?.error?.code;
            if (code === ERROR_CODES.TODO_ALREADY_COMPLETED) {
              setServerError(t('todo.alreadyCompleted'));
            } else if (error.response?.data?.message) {
              setServerError(error.response.data.message);
            } else {
              setServerError(t('common.error'));
            }
          } else {
            setServerError(t('common.error'));
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!todo) return null;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-[18px] font-bold text-gray-900">{t('todo.editTitle')}</h1>
      </header>

      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm max-w-2xl">
        <TodoForm
          initialData={todo}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          submitButtonText={t('todo.updateButton')}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
