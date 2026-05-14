import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface CategoryFormProps {
  onSubmit: (name: string) => void;
  isPending: boolean;
}

export function CategoryForm({ onSubmit, isPending }: CategoryFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('category.nameRequired'));
      return;
    }

    if (name.length > 50) {
      setError(t('category.nameTooLong'));
      return;
    }

    setError('');
    onSubmit(name);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder={t('category.namePlaceholder')}
            errorMessage={error}
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          isLoading={isPending}
          className="h-10 px-6 shrink-0"
        >
          {t('common.add')}
        </Button>
      </div>
    </form>
  );
}
