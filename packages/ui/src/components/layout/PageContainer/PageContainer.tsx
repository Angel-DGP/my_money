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
 * Arquitectura de scroll correcta y definitiva:
 *
 *   [Wrapper externo] flex-col h-full  ← sin overflow
 *   ├── [Scroll container] flex-1 min-h-0 overflow-y-auto
 *   │   ├── PageContainer.Header  sticky top-0  ← se pega al tope del scroll
 *   │   └── PageContainer.Body   contenido de la página
 *   └── [FooterPortalSlot] shrink-0  ← FUERA del scroll, SIEMPRE al fondo
 *       └── PageContainerFooter  (renderizado via portal desde cualquier profundidad)
 *
 * El footer nunca necesita sticky porque vive estructuralmente al fondo.
 * El header sticky funciona correctamente dentro del scroll container.
 */
export const PageContainerComponent = ({ children, className }: PageContainerProps) => {
  return (
    <FooterPortalProvider>
      {/* Wrapper externo: NO scrollea, solo distribuye el espacio en columna */}
      <div className="flex flex-col h-full w-full">
        {/* Scroll container: todo el contenido scrollea aquí. pb-6 garantiza
            espacio al fondo sin importar qué clases pasen las páginas al Body */}
        <div className={cn('flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-6', className)}>
          {children}
        </div>
        {/* Footer slot: siempre fuera del scroll, siempre pegado al fondo */}
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
          ? 'px-4 sm:px-6 lg:px-8 pt-6'
          : 'px-4 sm:px-6 lg:px-8 pt-6',
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
 * Se renderiza via portal en FooterPortalSlot, que vive FUERA del scroll
 * container. No necesita sticky ni z-index especial: siempre está al fondo
 * de forma natural, como un flex sibling del scroll container.
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
          'bg-background/80 backdrop-blur-md border-t border-border-subtle',
          'flex items-center justify-between gap-3',
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
