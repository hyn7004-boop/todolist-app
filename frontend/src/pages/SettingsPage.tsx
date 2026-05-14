import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useUpdateMe } from '../hooks/useUpdateMe';
import { useDeleteMe } from '../hooks/useDeleteMe';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useToastStore } from '../stores/toastStore';
import { isValidPassword, isNotEmpty, isMaxLength } from '../utils/validators';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const toast = useToastStore((s) => s.show);

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const updateMeMutation = useUpdateMe();
  const deleteMeMutation = useDeleteMe();

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateName = () => {
    if (!isNotEmpty(name)) {
      toast(t('settings.nameRequired'), 'error');
      return;
    }
    if (!isMaxLength(name, 50)) {
      toast(t('settings.nameRequired'), 'error');
      return;
    }

    updateMeMutation.mutate({ name }, {
      onSuccess: () => {
        toast(t('settings.nameUpdateSuccess'), 'success');
      },
      onError: (error: any) => {
        toast(error.response?.data?.message || t('common.error'), 'error');
      }
    });
  };

  const handleUpdatePassword = () => {
    if (!isNotEmpty(currentPassword)) {
      toast(t('settings.currentPasswordRequired'), 'error');
      return;
    }
    if (!isValidPassword(newPassword)) {
      toast(t('settings.passwordPolicy'), 'error');
      return;
    }

    updateMeMutation.mutate({ current_password: currentPassword, new_password: newPassword }, {
      onSuccess: () => {
        toast(t('settings.passwordUpdateSuccess'), 'success');
        setCurrentPassword('');
        setNewPassword('');
      },
      onError: (error: any) => {
        toast(error.response?.data?.message || t('common.error'), 'error');
      }
    });
  };

  const handleDeleteAccount = () => {
    deleteMeMutation.mutate(undefined, {
      onError: (error: any) => {
        toast(error.response?.data?.message || t('common.error'), 'error');
        setIsDeleteModalOpen(false);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 md:px-8">
      <h1 className="text-lg font-semibold mb-8" style={{ color: 'var(--color-text-primary)' }}>{t('settings.title')}</h1>

      <div
        className="rounded-lg p-6 mb-8"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('auth.email')}</label>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-text-primary)' }}>{user?.email}</p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-sm font-semibold mb-4 pb-2 border-bottom" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}>{t('settings.nameSection')}</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <Input
            label={t('auth.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.namePlaceholder')}
          />
          <div className="flex justify-start">
            <Button
              onClick={handleUpdateName}
              isLoading={updateMeMutation.isPending}
            >
              {t('settings.nameSection')}
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-12 pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-sm font-semibold mb-4 pb-2" style={{ color: 'var(--color-text-primary)' }}>{t('settings.passwordSection')}</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <Input
            label={t('settings.currentPassword')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('settings.currentPasswordPlaceholder')}
          />
          <Input
            label={t('settings.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('settings.newPasswordPlaceholder')}
          />
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            {t('settings.passwordPolicy')}
          </p>
          <div className="flex justify-start">
            <Button
              onClick={handleUpdatePassword}
              isLoading={updateMeMutation.isPending}
            >
              {t('settings.passwordSection')}
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="bg-red-50 border border-red-100 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-red-600 mb-2">{t('settings.withdrawSection')}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {t('settings.withdrawDescription')}
          </p>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {t('settings.withdrawButton')}
          </Button>
        </div>
      </section>

      <Modal
        isOpen={isDeleteModalOpen}
        title={t('settings.withdrawConfirmTitle')}
        message={t('settings.withdrawConfirmMessage')}
        confirmLabel={t('settings.withdrawConfirmLabel')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDanger
      />

    </div>
  );
};

export default SettingsPage;
