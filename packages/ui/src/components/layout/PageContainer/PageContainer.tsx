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
 * Shell de página con scroll arquitecturalmente correcto:
 *
 *   PageContainer (h-full flex-col, provee FooterPortalProvider)
 *   ├── PageContainer.Header  (shrink-0)
 *   ├── PageContainer.Body    (flex-1 min-h-0 overflow-y-auto)  ← ÚNICO scroll
 *   │   └── cualquier contenido, incluyendo FormLayout
 *   └── FooterPortalSlot      ← aquí aparece el footer, fuera del scroll
 *
 * PageContainer.Footer usa FooterPortal para renderizarse en el Slot,
 * independientemente de cuán profundo esté anidado.
 */
export const PageContainerComponent = ({ children, className }: PageContainerProps) => {
  return (
    <FooterPortalProvider>
      <div className={cn('flex flex-col h-full w-full', className)}>
        {children}
        {/* Footer portal target: renders PageContainerFooter here, outside scroll */}
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
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 shrink-0', className)}>
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
        'flex-1 min-h-0 overflow-y-auto custom-scrollbar',
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
 * bottom of PageContainer, OUTSIDE the scroll area. This means the footer is
 * always visible regardless of scroll position and never affects layout.
 *
 * No sticky, no z-index hacks needed.
 */
const PageContainerFooter = ({
  children,
  className,
}: PageContainerFooterProps) => {
  return (
    <FooterPortal>
      <div
        className={cn(
          'shrink-0',
          'px-4 sm:px-6 lg:px-8 py-4',
          'bg-background/95 backdrop-blur-md border-t border-border-subtle',
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
