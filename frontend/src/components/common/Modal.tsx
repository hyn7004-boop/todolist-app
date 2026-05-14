import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export function Modal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  title,
  confirmLabel,
  cancelLabel,
  isDanger = false,
}: ModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="rounded-xl p-6 w-[calc(100%-32px)]"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          minWidth: 320,
          maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'modal-in 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
        )}
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="min-h-[44px] px-5 py-2 rounded-[6px] text-sm font-semibold border transition-colors hover:bg-[var(--color-hover)]"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="min-h-[44px] px-5 py-2 rounded-[6px] text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: isDanger ? '#DC2626' : '#2563EB' }}
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
