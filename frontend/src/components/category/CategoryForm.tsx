import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { CreateCategoryRequest } from '../../types/category.types';

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryRequest) => void;
  isPending: boolean;
}

export function CategoryForm({ onSubmit, isPending }: CategoryFormProps) {
  const { t } = useTranslation();
  const [names, setNames] = useState<CreateCategoryRequest>({ name_ko: '', name_en: '', name_zh: '' });
  const [errors, setErrors] = useState<Partial<CreateCategoryRequest>>({});

  const validate = (): boolean => {
    const next: Partial<CreateCategoryRequest> = {};
    if (!names.name_ko.trim()) {
      next.name_ko = t('category.nameRequired');
    } else if (names.name_ko.length > 50) {
      next.name_ko = t('category.nameTooLong');
    }
    if (names.name_en.length > 50) next.name_en = t('category.nameTooLong');
    if (names.name_zh.length > 50) next.name_zh = t('category.nameTooLong');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(names);
    setNames({ name_ko: '', name_en: '', name_zh: '' });
  };

  const update = (field: keyof CreateCategoryRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNames((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <Input
        label={t('category.nameKo')}
        value={names.name_ko}
        onChange={update('name_ko')}
        placeholder={t('category.namePlaceholder')}
        errorMessage={errors.name_ko}
        disabled={isPending}
        required
      />
      <Input
        label={t('category.nameEn')}
        value={names.name_en}
        onChange={update('name_en')}
        placeholder={t('category.nameEnPlaceholder')}
        errorMessage={errors.name_en}
        disabled={isPending}
      />
      <Input
        label={t('category.nameZh')}
        value={names.name_zh}
        onChange={update('name_zh')}
        placeholder={t('category.nameZhPlaceholder')}
        errorMessage={errors.name_zh}
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isPending} className="h-10 px-6">
          {t('common.add')}
        </Button>
      </div>
    </form>
  );
}
