import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { useCreateCardBrand } from '../../features/catalogs/api/useCatalogs';
import { CardBrandForm } from '../../features/catalogs/ui/CardBrandForm';

export function NewCardBrandPage() {
  const navigate = useNavigate();
  const createBrand = useCreateCardBrand();

  const handleSubmit = (data: unknown) => {
    createBrand.mutate(data, {
      onSuccess: () => {
        navigate('/catalogs/cards');
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Marca de Tarjeta"
        description="Agrega una nueva red o marca (ej. Visa, Mastercard)."
        backTo={() => navigate('/catalogs/cards')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardBrandForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs/cards')}
          isLoading={createBrand.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
