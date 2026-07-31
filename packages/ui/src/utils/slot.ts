import * as React from 'react';
import { mergeProps } from './mergeProps';
import { composeRefs } from './composeRefs';

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Slot component that merges its props with its immediate child.
 * Useful for the `asChild` pattern to avoid creating wrapper elements.
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>((props, ref) => {
  const { children, ...slotProps } = props;

  if (React.isValidElement(children)) {
    // If the child is a valid React element, merge props and refs
    return React.cloneElement(children, {
      ...mergeProps(slotProps, children.props as any),
      ref: ref ? composeRefs(ref, (children as any).ref) : (children as any).ref,
    } as any);
  }

  // If there's no valid element, render children (e.g. text or multiple children if misused)
  if (React.Children.count(children) > 1) {
    React.Children.only(null);
  }
  
  return null;
});

Slot.displayName = 'Slot';
