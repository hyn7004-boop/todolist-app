import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { TodoForm } from '../components/todo/TodoForm';
import { useCreateTodo } from '../hooks/useCreateTodo';
import type { CreateTodoRequest } from '../types/todo.types';

export default function TodoCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mutate: createTodo, isPending } = useCreateTodo();
  const [serverError, setServerError] = useState('');

  const handleSubmit = (data: CreateTodoRequest) => {
    setServerError('');
    createTodo(data, {
      onSuccess: () => {
        navigate('/todos');
      },
      onError: (error) => {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          setServerError(error.response.data.message);
        } else {
          setServerError(t('common.error'));
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-[18px] font-bold text-gray-900">{t('todo.createTitle')}</h1>
      </header>

      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm max-w-2xl">
        <TodoForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          submitButtonText={t('todo.createButton')}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
