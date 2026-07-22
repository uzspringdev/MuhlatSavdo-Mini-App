import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useToastStore } from '@/shared/store/toastStore';

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] safe-top px-4 pt-3 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            className={clsx(
              'pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-3 shadow-lg text-sm font-semibold text-white active:scale-[0.98] transition-transform',
              toast.type === 'error' && 'bg-di-red',
              toast.type === 'success' && 'bg-emerald-500',
              toast.type === 'info' && 'bg-neutral-800',
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
