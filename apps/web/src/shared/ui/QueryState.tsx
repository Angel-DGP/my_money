import React from 'react';
import { Icon, Button } from '@mymoney/ui';

interface QueryStateProps<T> {
  data: T | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ComponentProps<typeof Icon>['name'];
  onRetry?: () => void;
  children: (data: NonNullable<T>) => React.ReactNode;
}

export function QueryState<T>({
  data,
  isLoading,
  isError,
  error,
  emptyTitle = 'No hay datos',
  emptyDescription = 'Aún no se ha creado ningún registro.',
  emptyIcon = 'inbox',
  onRetry,
  children,
}: QueryStateProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-surface rounded-2xl border border-border-subtle animate-pulse">
        <Icon name="loader-2" className="animate-spin text-primary-500 mb-3" size="lg" />
        <span className="text-xs text-text-secondary">Cargando información...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-surface border border-error-500/25 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-error-500/10 flex items-center justify-center text-error-500 mb-3.5">
          <Icon name="alert-triangle" size="md" />
        </div>
        <h3 className="text-base font-bold text-text-primary">Error al cargar datos</h3>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 mb-5 max-w-md leading-relaxed">
          {error?.message === 'Network Error'
            ? 'No se pudo conectar con el servidor. Es posible que el servidor en la nube esté despertando o no haya conexión.'
            : (error?.message || 'Ha ocurrido un error inesperado al consultar la información.')}
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <Icon name="refresh-cw" size="xs" className="mr-1.5" />
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  const isEmpty =
    data === null ||
    data === undefined ||
    (Array.isArray(data) && data.length === 0);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border-subtle rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted mb-3.5">
          <Icon name={emptyIcon} size="md" />
        </div>
        <h3 className="text-base font-bold text-text-primary">{emptyTitle}</h3>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-md">{emptyDescription}</p>
      </div>
    );
  }

  return <>{children(data as NonNullable<T>)}</>;
}
