import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../common/Input';
import { DatePicker } from '../common/DatePicker';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { useCategories } from '../../hooks/useCategories';
import { getTodayKST, isValidDueDate } from '../../utils/dateUtils';
import { isNotEmpty, isMaxLength } from '../../utils/validators';
import { getCategoryName } from '../../utils/categoryUtils';
import { useLanguage } from '../../hooks/useLanguage';
import type { CreateTodoRequest, Todo } from '../../types/todo.types';

interface TodoFormProps {
  initialData?: Todo;
  onSubmit: (data: CreateTodoRequest) => void;
  isLoading?: boolean;
  submitButtonText: string;
  serverError?: string;
}

export function TodoForm({ initialData, onSubmit, isLoading, submitButtonText, serverError }: TodoFormProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const [formData, setFormData] = useState<CreateTodoRequest>({
    title: initialData?.title ?? '',
    category_id: initialData?.category_id ?? '',
    due_date: initialData?.due_date ?? getTodayKST(),
    description: initialData?.description ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        category_id: initialData.category_id,
        due_date: initialData.due_date,
        description: initialData.description ?? '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData((prev) => ({ ...prev, category_id: categories[0].category_id }));
    }
  }, [categories, formData.category_id]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isNotEmpty(formData.title)) {
      newErrors.title = t('todo.titleRequired');
    } else if (!isMaxLength(formData.title, 200)) {
      newErrors.title = t('todo.titleTooLong');
    }

    if (!formData.category_id) {
      newErrors.category_id = t('todo.categoryRequired');
    }

    if (!formData.due_date) {
      newErrors.due_date = t('todo.dueDateRequired');
    } else if (!isValidDueDate(formData.due_date)) {
      newErrors.due_date = t('todo.dueDateInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.category_id,
    label: getCategoryName(cat, currentLanguage),
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-lg" noValidate>
      {serverError && (
        <div
          className="px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #DC2626' }}
        >
          {serverError}
        </div>
      )}

      <Input
        label={t('todo.title')}
        placeholder={t('todo.titlePlaceholder')}
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        errorMessage={errors.title}
        data-testid="title-input"
        required
      />

      <Select
        label={t('todo.category')}
        value={formData.category_id}
        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
        options={categoryOptions}
        errorMessage={errors.category_id}
        disabled={isCategoriesLoading}
        data-testid="category-select"
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {t('todo.dueDate')}
        </label>
        <DatePicker
          value={formData.due_date}
          onChange={(v) => setFormData({ ...formData, due_date: v })}
          className="w-full h-10 px-3 py-2 border rounded-[6px] text-sm outline-none transition-all duration-150"
          style={{
            backgroundColor: 'var(--color-input-bg)',
            borderColor: errors.due_date ? '#DC2626' : 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        {errors.due_date && (
          <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{errors.due_date}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-medium text-gray-700">{t('todo.description')}</label>
        <textarea
          className={`w-full min-h-[100px] px-3 py-2 border rounded-[6px] text-sm text-gray-900 bg-white outline-none transition-all duration-150 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-400 resize-none ${
            errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100'
          }`}
          placeholder={t('todo.descriptionPlaceholder')}
          value={formData.description ?? ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isLoading} className="px-8">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
