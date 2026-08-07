import React from 'react';
import { useSelectContext } from './hooks/useSelect';

export function SelectContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSelectContext();

  if (!isOpen) return null;

  return (
    <div className="absolute z-50 mt-1 max-h-64 w-full flex flex-col rounded-xl border border-border-subtle bg-surface/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
      {children}
    </div>
  );
}
