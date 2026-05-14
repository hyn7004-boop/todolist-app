import { useTranslation } from 'react-i18next';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { CategoryForm } from '../components/category/CategoryForm';
import { CategoryItem } from '../components/category/CategoryItem';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToastStore } from '../stores/toastStore';
import { ERROR_CODES } from '../constants/errorCodes';

export default function CategoryPage() {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const toast = useToastStore((s) => s.show);

  const handleCreateCategory = (name: string) => {
    createMutation.mutate(name, {
      onSuccess: () => {
        toast(t('category.createSuccess'), 'success');
      },
      onError: (error: any) => {
        const errorCode = error.response?.data?.error?.code;
        if (errorCode === ERROR_CODES.DUPLICATE_CATEGORY_NAME) {
          toast(t('category.duplicate'), 'error');
        } else {
          toast(t('category.deleteError'), 'error');
        }
      },
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteMutation.mutate(categoryId, {
      onSuccess: () => {
        toast(t('category.deleteSuccess'), 'success');
      },
      onError: (error: any) => {
        const errorCode = error.response?.data?.error?.code;

        if (errorCode === ERROR_CODES.CATEGORY_HAS_TODOS) {
          toast(t('category.hasTodos'), 'error');
        } else {
          toast(t('category.deleteError'), 'error');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-[18px] font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>{t('category.title')}</h1>

      <div className="mb-8">
        <CategoryForm onSubmit={handleCreateCategory} isPending={createMutation.isPending} />
      </div>

      <div className="flex flex-col gap-3">
        {categories?.map((category) => (
          <CategoryItem
            key={category.category_id}
            category={category}
            onDelete={handleDeleteCategory}
            isDeleting={deleteMutation.isPending && deleteMutation.variables === category.category_id}
          />
        ))}
      </div>

    </div>
  );
}
