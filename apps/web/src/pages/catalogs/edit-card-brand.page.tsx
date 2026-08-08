import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { useUpdateCardBrand, useCardBrands } from '../../features/catalogs/api/useCatalogs';
import { CardBrandForm } from '../../features/catalogs/ui/CardBrandForm';

export function EditCardBrandPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const updateBrand = useUpdateCardBrand();
  const { data: brands, isLoading } = useCardBrands();

  const brandToEdit = brands?.find(b => b.id === id);

  const handleSubmit = (data: unknown) => {
    if (!id) return;
    updateBrand.mutate({ id, data }, {
      onSuccess: () => {
        navigate('/catalogs');
      }
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageContainer.Header title="Cargando..." backTo={() => navigate('/catalogs')} />
      </PageContainer>
    );
  }

  if (!brandToEdit) {
    return (
      <PageContainer>
        <PageContainer.Header title="Marca no encontrada" backTo={() => navigate('/catalogs')} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContainer.Header
        title="Editar Marca de Tarjeta"
        description="Modifica el nombre de la red o marca de tarjeta."
        backTo={() => navigate('/catalogs')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardBrandForm
          initialData={brandToEdit}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs')}
          isLoading={updateBrand.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
