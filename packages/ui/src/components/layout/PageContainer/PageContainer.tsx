import React from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../../core/Button';
import { Icon } from '../../core/Icon';
import {
  FooterPortalProvider,
  FooterPortalSlot,
  FooterPortal,
} from './PageContainerFooterPortal';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * PageContainer
 *
 * Shell de página con scroll arquitecturalmente correcto y efecto backdrop blur:
 * El PageContainerComponent es el único scroll container (overflow-y-auto).
 * Esto permite que el contenido del Body pase por DEBAJO de Header y Footer,
 * logrando un efecto backdrop-blur muy premium en ambos extremos de la página.
 */
export const PageContainerComponent = ({ children, className }: PageContainerProps) => {
  return (
    <FooterPortalProvider>
      <div className={cn('flex flex-col h-full w-full overflow-y-auto custom-scrollbar relative', className)}>
        {children}
        {/* Footer portal target: renders PageContainerFooter here, outside body scroll context but inside the page container scroll wrapper */}
        <FooterPortalSlot />
      </div>
    </FooterPortalProvider>
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

const PageContainerHeader = ({
  title,
  description,
  backTo,
  actions,
  className,
}: PageContainerHeaderProps) => {
  return (
    <div className={cn(
      'sticky top-0 z-30 shrink-0',
      'bg-background/80 backdrop-blur-md border-b border-border-subtle/50',
      'flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6',
      className
    )}>
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
PageContainerHeader.displayName = 'PageContainerHeader';

// ─── Body ──────────────────────────────────────────────────────────────────

export interface PageContainerBodyProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'transparent';
}

const PageContainerBody = ({
  children,
  className,
  variant = 'card',
}: PageContainerBodyProps) => {
  return (
    <div
      className={cn(
        'flex-1',
        variant === 'card'
          ? 'px-4 sm:px-6 lg:px-8 pt-6 pb-6'
          : 'px-4 sm:px-6 lg:px-8 pt-6 pb-6',
        className,
      )}
    >
      {variant === 'card' ? (
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6 sm:p-8">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
PageContainerBody.displayName = 'PageContainerBody';

// ─── Footer ────────────────────────────────────────────────────────────────

export interface PageContainerFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainerFooter
 *
 * Renders itself via a React portal into the FooterPortalSlot placed at the
 * bottom of PageContainer, OUTSIDE the body container structure but inside
 * the page scroll context. It stays sticky bottom-0, showing blurred content
 * beneath it when scrolled, and fits perfectly at the end of the page.
 */
const PageContainerFooter = ({
  children,
  className,
}: PageContainerFooterProps) => {
  return (
    <FooterPortal>
      <div
        className={cn(
          'sticky bottom-0 z-30 shrink-0',
          'px-4 sm:px-6 lg:px-8 py-4',
          'bg-background/80 backdrop-blur-md border-t border-border-subtle',
          'flex justify-end gap-3',
          className,
        )}
      >
        {children}
      </div>
    </FooterPortal>
  );
};
PageContainerFooter.displayName = 'PageContainerFooter';

export const PageContainer = Object.assign(PageContainerComponent, {
  Header: PageContainerHeader,
  Body: PageContainerBody,
  Footer: PageContainerFooter,
});
