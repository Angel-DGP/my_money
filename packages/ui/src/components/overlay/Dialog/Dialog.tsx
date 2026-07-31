import * as React from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '../../../utils/slot';
import { KeyboardKeys } from '../../../utils/keyboard';
import { createDataState } from '../../../utils/dataAttributes';

export interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

export function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a <Dialog.Root>');
  }
  return context;
}

export interface DialogRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const DialogRoot: React.FC<DialogRootProps> = ({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const baseId = React.useId();

  // Escape key and Body scroll lock
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KeyboardKeys.Escape) {
        handleOpenChange(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleOpenChange]);

  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange: handleOpenChange,
        titleId: `${baseId}-title`,
        descriptionId: `${baseId}-desc`,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};
DialogRoot.displayName = 'Dialog.Root';

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
DialogTrigger.displayName = 'Dialog.Trigger';

export interface DialogPortalProps {
  children: React.ReactNode;
}

const DialogPortal: React.FC<DialogPortalProps> = ({ children }) => {
  const { open } = useDialogContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(children, document.body);
};
DialogPortal.displayName = 'Dialog.Portal';

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type="button"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onOpenChange(false);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
DialogClose.displayName = 'Dialog.Close';

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ asChild = false, ...props }, ref) => {
    const { titleId } = useDialogContext();
    const Comp = asChild ? Slot : 'h2';

    return <Comp ref={ref} id={titleId} {...props} />;
  }
);
DialogTitle.displayName = 'Dialog.Title';

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ asChild = false, ...props }, ref) => {
    const { descriptionId } = useDialogContext();
    const Comp = asChild ? Slot : 'p';

    return <Comp ref={ref} id={descriptionId} {...props} />;
  }
);
DialogDescription.displayName = 'Dialog.Description';

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Close: DialogClose,
  Title: DialogTitle,
  Description: DialogDescription,
};
