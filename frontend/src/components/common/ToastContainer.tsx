import { useToastStore } from '../../stores/toastStore';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, hide } = useToastStore();

  return (
    <div className="fixed z-[200] top-[72px] right-4 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => hide(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
