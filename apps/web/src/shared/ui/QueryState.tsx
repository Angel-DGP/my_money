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
      <div className="flex justify-center p-12">
        <Icon name="loader-2" className="animate-spin text-primary-500" size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-error-50 border border-error-200 rounded-lg">
        <Icon name="alert-triangle" size="lg" className="text-error-600 mb-4" />
        <h3 className="text-lg font-medium text-error-800">Error al cargar datos</h3>
        <p className="text-sm text-error-600 mt-1 mb-4">{error?.message || 'Ha ocurrido un error inesperado.'}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>Reintentar</Button>
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
      <div className="flex flex-col items-center justify-center p-12 text-center bg-background border border-border-subtle rounded-lg">
        <Icon name={emptyIcon} size="lg" className="text-text-secondary mb-4" />
        <h3 className="text-lg font-medium text-text-primary">{emptyTitle}</h3>
        <p className="text-sm text-text-secondary mt-1">{emptyDescription}</p>
      </div>
    );
  }

  return <>{children(data as NonNullable<T>)}</>;
}
