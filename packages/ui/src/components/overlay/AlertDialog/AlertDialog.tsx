import { Dialog } from '../Dialog';
import { Modal, ModalHeader, ModalFooter } from '../Modal';
import { Button } from '../../core/Button';
import { Icon, type IconName } from '../../core/Icon';

export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: IconName;
  type?: 'error' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isAlertOnly?: boolean; // If true, only shows Confirm button (e.g. for simple notifications)
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading,
  isAlertOnly = false,
}: AlertDialogProps) {
  
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onOpenChange(false);
    }
  };

  const colors = {
    error: 'text-error-500 bg-error-50 dark:bg-error-500/10',
    warning: 'text-warning-500 bg-warning-50 dark:bg-warning-500/10',
    info: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10',
    success: 'text-success-500 bg-success-50 dark:bg-success-500/10',
  };
  
  const iconColors = {
    error: 'text-error-600 dark:text-error-500',
    warning: 'text-warning-600 dark:text-warning-500',
    info: 'text-primary-600 dark:text-primary-500',
    success: 'text-success-600 dark:text-success-500',
  };

  const defaultIcons: Record<string, IconName> = {
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info',
    success: 'check-circle',
  };

  const displayIcon = icon || defaultIcons[type];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Modal className="sm:max-w-[425px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${colors[type]}`}>
              <Icon name={displayIcon as IconName} className={iconColors[type]} size="sm" />
            </div>
            
            <div className="flex flex-col gap-2 pt-1 text-center sm:text-left w-full">
              <ModalHeader>
                <Dialog.Title className="text-lg font-semibold text-text-primary">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="text-sm text-text-secondary mt-2">
                    {description}
                  </Dialog.Description>
                )}
              </ModalHeader>
              
              <ModalFooter className="mt-6 w-full">
                {!isAlertOnly && (
                  <Button 
                    variant="ghost" 
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {cancelText}
                  </Button>
                )}
                <Button 
                  variant={type === 'error' ? 'destructive' : 'primary'}
                  onClick={handleConfirm}
                  disabled={isLoading}
                  leftIcon={isLoading ? 'loader-2' : undefined}
                  className="w-full sm:w-auto"
                >
                  {confirmText}
                </Button>
              </ModalFooter>
            </div>
          </div>
        </Modal>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
