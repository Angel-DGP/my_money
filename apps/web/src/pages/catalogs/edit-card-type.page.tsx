import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { useUpdateCardType, useCardTypes } from '../../features/catalogs/api/useCatalogs';
import { CardTypeForm } from '../../features/catalogs/ui/CardTypeForm';

export function EditCardTypePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const updateType = useUpdateCardType();
  const { data: types, isLoading } = useCardTypes();

  const typeToEdit = types?.find(t => t.id === id);

  const handleSubmit = (data: unknown) => {
    if (!id) return;
    updateType.mutate({ id, data }, {
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

  if (!typeToEdit) {
    return (
      <PageContainer>
        <PageContainer.Header title="Tipo no encontrado" backTo={() => navigate('/catalogs')} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContainer.Header
        title="Editar Tipo de Tarjeta"
        description="Modifica el nombre del tipo de tarjeta."
        backTo={() => navigate('/catalogs')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardTypeForm
          initialData={typeToEdit}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs')}
          isLoading={updateType.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
