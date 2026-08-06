import { Button, Icon } from '@mymoney/ui';
import { useRouteError, useNavigate } from 'react-router-dom';

export function ErrorPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-6 rounded-full bg-error-50 p-6">
        <Icon name="alert-triangle" size="lg" className="text-error-600" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-text-primary">¡Algo salió mal!</h1>
      <p className="mb-6 max-w-md text-text-secondary">
        Ha ocurrido un error inesperado en la aplicación.
      </p>
      
      {error && (
        <div className="mb-8 w-full max-w-lg rounded-md bg-surface p-4 text-left font-mono text-sm text-text-primary overflow-auto">
          {error.statusText || error.message || 'Error desconocido'}
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <Icon name="loader-2" size="sm" className="mr-2" />
          Recargar página
        </Button>
        <Button onClick={() => navigate('/')}>
          <Icon name="home" size="sm" className="mr-2" />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
