import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';
import { Icon, type IconName } from '../../core/Icon';
import { Button } from '../../core/Button';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
  action?: ToastAction;
  cancel?: ToastAction;
}

// Global state for toasts
let memoryState: ToastProps[] = [];
let listeners: Array<(toasts: ToastProps[]) => void> = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener(memoryState));
};

let toastCount = 0;

export const toast = (props: Omit<ToastProps, 'id'>) => {
  const id = `toast-${++toastCount}`;
  const newToast = { ...props, id, duration: props.duration ?? 5000 };
  
  memoryState = [...memoryState, newToast];
  notifyListeners();

  // Auto-dismiss
  if (newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }

  return id;
};

export const dismissToast = (id: string) => {
  memoryState = memoryState.filter((t) => t.id !== id);
  notifyListeners();
};

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return { toasts, toast, dismiss: dismissToast };
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body
  );
}

const variantStyles: Record<NonNullable<ToastProps['variant']>, { bg: string; icon: IconName; iconClass: string }> = {
  default: { bg: 'bg-bg-base border-border-subtle', icon: 'info', iconClass: 'text-text-base' },
  success: { bg: 'bg-success-50 border-success-200', icon: 'check-circle', iconClass: 'text-success-600' },
  error: { bg: 'bg-error-50 border-error-200', icon: 'alert-circle', iconClass: 'text-error-600' },
  warning: { bg: 'bg-warning-50 border-warning-200', icon: 'alert-triangle', iconClass: 'text-warning-600' },
};

const ToastItem: React.FC<{ toast: ToastProps; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const style = variantStyles[toast.variant || 'default'];

  return (
    <div
      role="alert"
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-full mt-4',
        style.bg
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        {toast.variant && toast.variant !== 'default' && (
          <Icon name={style.icon} className={cn('mt-0.5', style.iconClass)} />
        )}
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-text-base">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90 text-text-muted">{toast.description}</div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        {toast.cancel && (
          <Button variant="ghost" size="xs" onClick={() => { toast.cancel?.onClick(); onDismiss(); }}>
            {toast.cancel.label}
          </Button>
        )}
        {toast.action && (
          <Button size="xs" onClick={() => { toast.action?.onClick(); onDismiss(); }}>
            {toast.action.label}
          </Button>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-text-muted/50 opacity-0 transition-opacity hover:text-text-muted focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <Icon name="x" size="xs" />
        <span className="sr-only">Cerrar</span>
      </button>
    </div>
  );
};
