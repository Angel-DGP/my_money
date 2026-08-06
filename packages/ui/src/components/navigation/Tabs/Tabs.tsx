import * as React from 'react';
import { cn } from '../../../utils/cn';
import { KeyboardKeys } from '../../../utils/keyboard';
import { createDataOrientation, createDataState } from '../../../utils/dataAttributes';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs> provider');
  }
  return context;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue,
      value: controlledValue,
      onValueChange,
      orientation = 'horizontal',
      activationMode = 'automatic',
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    const baseId = React.useId();

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation, activationMode, baseId }}>
        <div
          ref={ref}
          className={cn(
            'flex',
            orientation === 'horizontal' ? 'flex-col' : 'flex-row gap-4',
            className
          )}
          {...createDataOrientation(orientation)}
          {...props}
        />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useTabsContext();

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-surface p-1 text-text-secondary',
          orientation === 'horizontal' ? 'h-10' : 'flex-col h-auto w-max',
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = 'Tabs.List';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, onKeyDown, onClick, ...props }, ref) => {
    const { value: selectedValue, onValueChange, orientation, activationMode, baseId } = useTabsContext();
    const isSelected = selectedValue === value;
    const triggerId = `${baseId}-trigger-${value}`;
    const contentId = `${baseId}-content-${value}`;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const triggerCollection = Array.from(
        e.currentTarget.closest('[role="tablist"]')?.querySelectorAll('[role="tab"]:not([disabled])') || []
      ) as HTMLButtonElement[];
      
      const currentIndex = triggerCollection.indexOf(e.currentTarget);
      let nextIndex = currentIndex;

      if (orientation === 'horizontal') {
        if (e.key === KeyboardKeys.ArrowRight) nextIndex = currentIndex + 1;
        if (e.key === KeyboardKeys.ArrowLeft) nextIndex = currentIndex - 1;
      } else {
        if (e.key === KeyboardKeys.ArrowDown) nextIndex = currentIndex + 1;
        if (e.key === KeyboardKeys.ArrowUp) nextIndex = currentIndex - 1;
      }
      
      if (e.key === KeyboardKeys.Home) nextIndex = 0;
      if (e.key === KeyboardKeys.End) nextIndex = triggerCollection.length - 1;

      if (nextIndex !== currentIndex) {
        // wrap around
        if (nextIndex < 0) nextIndex = triggerCollection.length - 1;
        if (nextIndex >= triggerCollection.length) nextIndex = 0;

        const nextTab = triggerCollection[nextIndex];
        if(nextTab) nextTab.focus();

        if (activationMode === 'automatic') {
          if(nextTab) nextTab.click();
        }
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={triggerId}
        aria-controls={contentId}
        aria-selected={isSelected}
        disabled={disabled}
        tabIndex={isSelected ? 0 : -1}
        onClick={(e) => {
          if (!disabled) onValueChange(value);
          onClick?.(e);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
          'data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm',
          orientation === 'vertical' && 'w-full text-left justify-start',
          className
        )}
        {...createDataState(isSelected ? 'active' : 'inactive')}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'Tabs.Trigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue, baseId } = useTabsContext();
    const isSelected = selectedValue === value;
    const triggerId = `${baseId}-trigger-${value}`;
    const contentId = `${baseId}-content-${value}`;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        id={contentId}
        role="tabpanel"
        aria-labelledby={triggerId}
        tabIndex={0}
        className={cn(
          'mt-2 ring-offset-bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          className
        )}
        {...createDataState(isSelected ? 'active' : 'inactive')}
        {...props}
      />
    );
  }
);
TabsContent.displayName = 'Tabs.Content';
