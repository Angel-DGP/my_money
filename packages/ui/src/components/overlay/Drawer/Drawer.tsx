import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';
import { Slot } from '../../../utils/slot';
import { KeyboardKeys } from '../../../utils/keyboard';
import { Icon } from '../../core/Icon';

export interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);

export function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be used within a <Drawer.Root>');
  }
  return context;
}

export interface DrawerRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const DrawerRoot: React.FC<DrawerRootProps> = ({
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
    <DrawerContext.Provider
      value={{
        open,
        onOpenChange: handleOpenChange,
        titleId: `${baseId}-title`,
        descriptionId: `${baseId}-desc`,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};
DrawerRoot.displayName = 'Drawer.Root';

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange } = useDrawerContext();
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
DrawerTrigger.displayName = 'Drawer.Trigger';

export interface DrawerPortalProps {
  children: React.ReactNode;
}

export const DrawerPortal: React.FC<DrawerPortalProps> = ({ children }) => {
  const { open } = useDrawerContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(children, document.body);
};
DrawerPortal.displayName = 'Drawer.Portal';

export interface DrawerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerOverlay = React.forwardRef<HTMLDivElement, DrawerOverlayProps>(
  ({ className, ...props }, ref) => {
    const { onOpenChange } = useDrawerContext();

    return (
      <div
        ref={ref}
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity',
          'animate-in fade-in duration-300',
          className
        )}
        {...props}
      />
    );
  }
);
DrawerOverlay.displayName = 'Drawer.Overlay';

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'md:max-w-md',
  md: 'md:max-w-lg',
  lg: 'md:max-w-xl',
  xl: 'md:max-w-2xl',
  full: 'md:max-w-4xl',
};

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, size = 'lg', ...props }, ref) => {
    const { titleId, descriptionId } = useDrawerContext();

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn(
            'fixed z-50 flex flex-col bg-surface border-border-subtle shadow-2xl',
            // Mobile (Bottom Sheet):
            'inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t',
            'animate-in slide-in-from-bottom duration-300',
            // Desktop (Slide-over Drawer from Right):
            'md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-full md:rounded-l-2xl md:rounded-r-none md:border-l md:border-t-0',
            'md:animate-in md:slide-in-from-right md:duration-300',
            sizeClasses[size],
            'w-full',
            className
          )}
          {...props}
        >
          {/* Mobile Grabber */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border-subtle my-2.5 md:hidden" />
          {children}
        </div>
      </DrawerPortal>
    );
  }
);
DrawerContent.displayName = 'Drawer.Content';

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  hideCloseButton?: boolean;
}

export const DrawerHeader = ({
  className,
  children,
  hideCloseButton = false,
  ...props
}: DrawerHeaderProps) => {
  const { onOpenChange } = useDrawerContext();

  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0',
        className
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1 text-left">{children}</div>
      {!hideCloseButton && (
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="p-2 -mr-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Cerrar"
        >
          <Icon name="x" size="sm" />
        </button>
      )}
    </div>
  );
};
DrawerHeader.displayName = 'Drawer.Header';

export interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useDrawerContext();

    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn('text-lg font-bold text-text-primary tracking-tight', className)}
        {...props}
      />
    );
  }
);
DrawerTitle.displayName = 'Drawer.Title';

export interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useDrawerContext();

    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn('text-xs text-text-secondary', className)}
        {...props}
      />
    );
  }
);
DrawerDescription.displayName = 'Drawer.Description';

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-6 py-5', className)}
        {...props}
      />
    );
  }
);
DrawerBody.displayName = 'Drawer.Body';

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

import { DrawerSummaryCard } from './DrawerSummaryCard';

export const DrawerFooter = ({ className, ...props }: DrawerFooterProps) => {
  return (
    <div
      className={cn(
        'px-6 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-surface-2/40 border-t border-border-subtle shrink-0 flex items-center justify-between gap-3',
        className
      )}
      {...props}
    />
  );
};
DrawerFooter.displayName = 'Drawer.Footer';

export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  SummaryCard: DrawerSummaryCard,
  Close: DrawerTrigger,
};
