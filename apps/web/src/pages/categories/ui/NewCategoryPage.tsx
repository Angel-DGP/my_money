import { useNavigate } from 'react-router-dom';
import { Button, Icon, toast, PageContainer } from '@mymoney/ui';
import { CategoryForm } from '@features/categories';
import { useCreateCategory } from '@entities/category';
import type { CreateCategoryDto } from '@entities/category';

export function NewCategoryPage() {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();

  const handleSubmit = (data: CreateCategoryDto) => {
    createCategory.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Categoría creada',
          description: 'La categoría se ha creado exitosamente.',
          variant: 'success',
        });
        navigate('/categories');
      },
      onError: () => {
        toast({
          title: 'Error al crear',
          description: 'No se pudo crear la categoría. Intenta de nuevo.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Categoría"
        description="Agrega una categoría para clasificar tus transacciones"
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <CategoryForm
          onSubmit={handleSubmit as any}
          onCancel={() => navigate('/categories')}
          isLoading={createCategory.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
