import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '../common/DatePicker';
import type { Category } from '../../types/category.types';
import type { TodoFilter as TodoFilterType } from '../../types/todo.types';
import { getCategoryName } from '../../utils/categoryUtils';
import { useLanguage } from '../../hooks/useLanguage';

interface TodoFilterProps {
  filters: TodoFilterType;
  categories: Category[];
  onChange: (filters: TodoFilterType) => void;
}

export function TodoFilter({ filters, categories, onChange }: TodoFilterProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [local, setLocal] = useState<TodoFilterType>(filters);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    setLocal(filters);
    setDateError('');
  }, [filters]);

  const update = (updates: Partial<TodoFilterType>) => {
    const next = { ...local, ...updates } as TodoFilterType;

    (Object.keys(next) as Array<keyof TodoFilterType>).forEach((k) => {
      if (next[k] === undefined) delete next[k];
    });

    setLocal(next);

    if (next.due_date_from && next.due_date_to && next.due_date_from > next.due_date_to) {
      setDateError(t('todo.dateRangeError'));
      return;
    }
    setDateError('');
    onChange(next);
  };

  const handleReset = () => {
    setLocal({});
    setDateError('');
    onChange({});
  };

  const inputClass = "h-11 px-3 border rounded-[6px] text-sm outline-none transition-colors";
  const inputStyle = {
    background: 'var(--color-input-bg)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div
      className="rounded-lg mb-6 p-4"
      style={{ background: 'var(--color-bg-sub)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-category" className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {t('todo.category')}
          </label>
          <select
            id="filter-category"
            className={inputClass}
            style={inputStyle}
            value={local.category_id ?? ''}
            onChange={(e) => update({ category_id: e.target.value || undefined })}
          >
            <option value="">{t('todo.selectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {getCategoryName(cat, currentLanguage)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-date-from" className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {t('todo.dateFrom')}
          </label>
          <DatePicker
            id="filter-date-from"
            value={local.due_date_from ?? ''}
            onChange={(v) => update({ due_date_from: v || undefined })}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-date-to" className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {t('todo.dateTo')}
          </label>
          <DatePicker
            id="filter-date-to"
            value={local.due_date_to ?? ''}
            onChange={(v) => update({ due_date_to: v || undefined })}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-status" className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {t('todo.status')}
          </label>
          <select
            id="filter-status"
            className={inputClass}
            style={inputStyle}
            value={local.is_completed === undefined ? '' : String(local.is_completed)}
            onChange={(e) => {
              const v = e.target.value;
              update({ is_completed: v === '' ? undefined : v === 'true' });
            }}
          >
            <option value="">{t('todo.all')}</option>
            <option value="true">{t('todo.completed')}</option>
            <option value="false">{t('todo.incomplete')}</option>
          </select>
        </div>
      </div>

      {dateError && (
        <p className="text-xs mb-2" style={{ color: '#DC2626' }}>
          {dateError}
        </p>
      )}

      <button
        type="button"
        onClick={handleReset}
        className="text-sm underline min-h-[44px] hover:opacity-80 transition-opacity"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {t('common.reset')}
      </button>
    </div>
  );
}
