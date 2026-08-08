import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { CategoryForm } from '@features/categories';
import { useUpdateCategory, useCategoriesQuery } from '@entities/category';
import type { UpdateCategoryDto } from '@entities/category';
import { QueryState } from '@shared/ui/QueryState';

export function EditCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isView = location.state?.isView;
  const { id } = useParams<{ id: string }>();
  
  const { data: categories, isLoading, isError, error } = useCategoriesQuery();
  const category = categories?.find(c => c.id === id);
  const updateCategory = useUpdateCategory();

  const handleSubmit = (data: UpdateCategoryDto) => {
    if (!id) return;
    
    updateCategory.mutate({ id, data }, {
      onSuccess: () => {
        toast({
          title: 'Categoría actualizada',
          description: 'Los cambios se han guardado exitosamente.',
          variant: 'success',
        });
        navigate('/categories');
      },
      onError: () => {
        toast({
          title: 'Error al actualizar',
          description: 'No se pudieron guardar los cambios.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title={isView ? "Ver Categoría" : "Editar Categoría"}
        description={isView ? "Detalles de la categoría" : "Modifica los detalles de la categoría"}
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <QueryState 
          data={category} 
          isLoading={isLoading} 
          isError={isError} 
          error={error}
        >
          {(cat) => (
            <CategoryForm
              initialData={cat}
              isView={isView}
              onSubmit={(data) => handleSubmit(data as UpdateCategoryDto)}
              onCancel={() => navigate('/categories')}
              isLoading={updateCategory.isPending}
            />
          )}
        </QueryState>
      </PageContainer.Body>
    </PageContainer>
  );
}
