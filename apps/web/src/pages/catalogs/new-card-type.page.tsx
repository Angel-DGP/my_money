import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { useCreateCardType } from '../../features/catalogs/api/useCatalogs';
import { CardTypeForm } from '../../features/catalogs/ui/CardTypeForm';

export function NewCardTypePage() {
  const navigate = useNavigate();
  const createType = useCreateCardType();

  const handleSubmit = (data: unknown) => {
    createType.mutate(data, {
      onSuccess: () => {
        navigate('/catalogs');
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nuevo Tipo de Tarjeta"
        description="Agrega una nueva clasificación (ej. Crédito, Débito)."
        backTo={() => navigate('/catalogs')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardTypeForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs')}
          isLoading={createType.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
