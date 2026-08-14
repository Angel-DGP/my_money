import * as React from 'react';
import { cn } from '../../../utils/cn';
import { useDialogContext } from '../Dialog/Dialog';
import { Icon } from '../../core/Icon';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, ...props }, ref) => {
    const { titleId, descriptionId, onOpenChange } = useDialogContext();
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          aria-hidden="true" 
          onClick={() => onOpenChange(false)}
        />
        
        {/* Modal Dialog */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn(
            'relative z-50 grid w-full max-w-lg gap-4 rounded-xl border border-border-subtle bg-background p-6 shadow-lg shadow-black/5 sm:rounded-2xl',
            className
          )}
          {...props}
        >
          {children}
          
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-bg-base transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:pointer-events-none"
          >
            <Icon name="x" size="sm" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  )
);
ModalHeader.displayName = 'Modal.Header';

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-3 mt-5 pt-3 border-t border-border-subtle', className)}
      {...props}
    />
  )
);
ModalFooter.displayName = 'Modal.Footer';
