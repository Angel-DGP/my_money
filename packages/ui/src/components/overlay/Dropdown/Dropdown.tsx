import * as React from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '../../../utils/slot';
import { cn } from '../../../utils/cn';
import { KeyboardKeys } from '../../../utils/keyboard';
import { createDataState, createDataSide, createDataAlign } from '../../../utils/dataAttributes';

export interface DropdownContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined);

export function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('Dropdown components must be used within <Dropdown.Root>');
  return context;
}

export interface DropdownRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownRoot: React.FC<DropdownRootProps> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement>(null);

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DropdownContext.Provider value={{ open, onOpenChange: handleOpenChange, triggerRef }}>
      {children}
    </DropdownContext.Provider>
  );
};
DropdownRoot.displayName = 'Dropdown.Root';

export interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = useDropdownContext();
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={(node: HTMLButtonElement | null) => {
          triggerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onOpenChange(!open);
          onClick?.(e);
        }}
        {...createDataState(open ? 'open' : 'closed')}
        {...props}
      />
    );
  }
);
DropdownTrigger.displayName = 'Dropdown.Trigger';

export interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  offset?: number;
}

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, side = 'bottom', align = 'center', offset = 4, children, ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = useDropdownContext();
    const [mounted, setMounted] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [coords, setCoords] = React.useState({ top: -9999, left: -9999 });

    React.useEffect(() => { setMounted(true); }, []);

    React.useEffect(() => {
      if (!open || !triggerRef.current || !contentRef.current) return;
      
      const updatePosition = () => {
        const trigger = triggerRef.current!.getBoundingClientRect();
        const content = contentRef.current!.getBoundingClientRect();
        
        let top = 0;
        let left = 0;

        // Base side
        switch (side) {
          case 'top':
            top = trigger.top - content.height - offset;
            break;
          case 'bottom':
            top = trigger.bottom + offset;
            break;
          case 'left':
            left = trigger.left - content.width - offset;
            break;
          case 'right':
            left = trigger.right + offset;
            break;
        }

        // Align
        if (side === 'top' || side === 'bottom') {
          if (align === 'start') left = trigger.left;
          else if (align === 'center') left = trigger.left + (trigger.width / 2) - (content.width / 2);
          else if (align === 'end') left = trigger.right - content.width;
        } else {
          if (align === 'start') top = trigger.top;
          else if (align === 'center') top = trigger.top + (trigger.height / 2) - (content.height / 2);
          else if (align === 'end') top = trigger.bottom - content.height;
        }

        setCoords({ top: top + window.scrollY, left: left + window.scrollX });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [open, side, align, offset, triggerRef]);

    React.useEffect(() => {
      if (!open) return;
      
      const handleClickOutside = (e: MouseEvent) => {
        if (
          contentRef.current && 
          !contentRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          onOpenChange(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === KeyboardKeys.Escape) onOpenChange(false);
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, onOpenChange, triggerRef]);

    if (!mounted || !open) return null;

    return createPortal(
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        style={{ top: coords.top, left: coords.left, position: 'absolute' }}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border-subtle bg-surface/80 dark:bg-surface/60 backdrop-blur-xl p-1 text-text-primary shadow-lg animate-in fade-in-80 zoom-in-95',
          className
        )}
        {...createDataState('open')}
        {...createDataSide(side)}
        {...createDataAlign(align)}
        {...props}
      >
        {children}
      </div>,
      document.body
    );
  }
);
DropdownContent.displayName = 'Dropdown.Content';

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = useDropdownContext();
    
    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={0}
        onClick={(e) => {
          onClick?.(e);
          onOpenChange(false);
        }}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-surface focus:bg-surface data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
DropdownItem.displayName = 'Dropdown.Item';

const DropdownSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-border-subtle', className)}
      {...props}
    />
  )
);
DropdownSeparator.displayName = 'Dropdown.Separator';

export const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Separator: DropdownSeparator,
};
