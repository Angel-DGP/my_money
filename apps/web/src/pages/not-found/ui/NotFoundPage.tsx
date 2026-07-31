import React from 'react';
import { Button, Icon } from '@mymoney/ui';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-bg-base p-4 text-center">
      <div className="mb-6 rounded-full bg-primary-50 p-6">
        <Icon name="search" size="lg" className="text-brand-600" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-text-base">Página no encontrada</h1>
      <p className="mb-8 max-w-md text-text-muted">
        Lo sentimos, no pudimos encontrar la página que estás buscando. Puede que haya sido movida o eliminada.
      </p>
      <Button onClick={() => navigate('/')}>
        <Icon name="arrow-left" size="sm" className="mr-2" />
        Volver al inicio
      </Button>
    </div>
  );
}
