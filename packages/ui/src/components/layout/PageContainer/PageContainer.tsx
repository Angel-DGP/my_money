import React from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../../core/Button';
import { Icon } from '../../core/Icon';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer
 *
 * Provee el padding de página y estructura flex-col.
 * Requiere que el contenedor scroll ancestro tenga:
 *   overflow-y-auto + min-h-0  (esencial en flex-col para que sticky funcione)
 */
export const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div className={cn('flex flex-col min-h-full w-full', className)}>
      {children}
    </div>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────

export interface PageContainerHeaderProps {
  title: string;
  description?: string;
  backTo?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

PageContainer.Header = function PageContainerHeader({
  title,
  description,
  backTo,
  actions,
  className,
}: PageContainerHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8', className)}>
      <div className="flex items-center gap-4">
        {backTo && (
          <Button variant="ghost" onClick={backTo} className="px-2 -ml-2" aria-label="Volver">
            <Icon name="chevron-left" size="sm" />
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h2>
          {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3 self-start sm:self-auto">{actions}</div>
      )}
    </div>
  );
};

// ─── Body ──────────────────────────────────────────────────────────────────

export interface PageContainerBodyProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'transparent';
}

PageContainer.Body = function PageContainerBody({
  children,
  className,
  variant = 'card',
}: PageContainerBodyProps) {
  return (
    <div
      className={cn(
        'px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col',
        variant === 'card'
          ? 'bg-surface p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-sm mx-4 sm:mx-6 lg:mx-8 mb-6'
          : 'bg-transparent',
        className,
      )}
    >
      {children}
    </div>
  );
};

// ─── Footer ────────────────────────────────────────────────────────────────

export interface PageContainerFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Footer sticky al bottom del scroll container.
 *
 * No tiene padding horizontal propio: hereda el del PageContainer (p-4/6/8).
 * No necesita negative margins porque no intenta salirse del PageContainer.
 * El scroll container con min-h-0 garantiza que sticky funcione correctamente.
 */
PageContainer.Footer = function PageContainerFooter({
  children,
  className,
}: PageContainerFooterProps) {
  return (
    <div
      className={cn(
        'mt-auto shrink-0 sticky bottom-0 z-40',
        // Restaura el padding horizontal y añade el vertical propio.
        'px-4 sm:px-6 lg:px-8 py-4',
        'bg-background/90 backdrop-blur-md border-t border-border-subtle',
        'flex justify-end gap-3',
        className,
      )}
    >
      {children}
    </div>
  );
};

PageContainer.Footer.displayName = 'PageContainerFooter';
