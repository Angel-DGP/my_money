import { AlertDialog } from '@mymoney/ui';
import { useGlobalErrorStore } from '../store/global-error.store';

export function GlobalErrorModal() {
  const { isOpen, title, message, hideError } = useGlobalErrorStore();

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={hideError}
      title={title}
      description={message}
      type="error"
      confirmText="Entendido"
      isAlertOnly={true}
    />
  );
}
