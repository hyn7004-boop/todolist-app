import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const TYPE_STYLES: Record<ToastType, { borderColor: string; color: string; background: string }> = {
  success: { borderColor: '#16A34A', color: '#15803D', background: '#F0FDF4' },
  error:   { borderColor: '#DC2626', color: '#B91C1C', background: '#FEF2F2' },
  warning: { borderColor: '#D97706', color: '#B45309', background: '#FFFBEB' },
  info:    { borderColor: '#2563EB', color: '#1D4ED8', background: '#EFF6FF' },
};

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const styles = TYPE_STYLES[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      className="fixed z-[200] min-w-[280px] max-w-[400px] px-4 py-3 rounded-lg flex items-center gap-2 text-sm"
      style={{
        top: 72,
        right: 16,
        borderLeft: `4px solid ${styles.borderColor}`,
        color: styles.color,
        background: styles.background,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        animation: 'toast-in 200ms ease-out',
      }}
    >
      {message}
    </div>
  );
}
