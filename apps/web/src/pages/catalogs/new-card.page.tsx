import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, PageContainer } from '@mymoney/ui';
import { useCreateCard } from '../../features/catalogs/api/useCatalogs';
import { CardForm } from '../../features/catalogs/ui/CardForm';

export function NewCardPage() {
  const navigate = useNavigate();
  const createCard = useCreateCard();

  const handleSubmit = (data: any) => {
    createCard.mutate(data, {
      onSuccess: () => {
        navigate('/catalogs');
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Tarjeta"
        description="Agrega una tarjeta para vincular a tus pagos o suscripciones."
        backTo={() => navigate(-1)}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs')}
          isLoading={createCard.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
