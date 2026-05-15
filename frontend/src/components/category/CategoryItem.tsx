import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/category.types';
import { Button } from '../common/Button';

interface CategoryItemProps {
  category: Category;
  displayName: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function CategoryItem({ category, displayName, onDelete, isDeleting }: CategoryItemProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg transition-colors hover:border-gray-300"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{displayName}</span>
        {category.is_default && (
          <span
            className="px-2 py-0.5 text-[11px] font-bold rounded"
            style={{ background: 'var(--color-bg-sub)', color: 'var(--color-text-muted)' }}
          >
            {t('category.defaultBadge')}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        onClick={() => onDelete(category.category_id)}
        disabled={category.is_default}
        isLoading={isDeleting}
        aria-label={t('common.delete')}
        className={`p-1 min-w-[32px] min-h-[32px] text-gray-400 hover:text-red-500 focus:text-red-500 ${
          category.is_default ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  );
}
