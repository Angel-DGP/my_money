import { useNavigate } from 'react-router-dom';
import { useCategoriesQuery, useDeleteCategory } from '@entities/category';
import type { Category } from '@entities/category';
import { CategoriesTable } from '@features/categories';
import { Button, Icon, toast, PageContainer } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';

export function CategoriesListWidget() {
  const navigate = useNavigate();
  const categoriesQuery = useCategoriesQuery();
  const deleteCategory = useDeleteCategory();

  const handleEdit = (category: Category) => {
    navigate(`/categories/edit/${category.id}`);
  };

  const handleDelete = (category: Category) => {
    if (category.is_system) {
      toast({
        title: 'Acción no permitida',
        description: 'No puedes eliminar una categoría del sistema.',
        variant: 'warning',
      });
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar la categoría ${category.name}?`)) {
      deleteCategory.mutate(category.id, {
        onSuccess: () => {
          toast({
            title: 'Categoría eliminada',
            description: 'La categoría ha sido eliminada.',
            variant: 'success',
          });
        },
        onError: () => {
          toast({
            title: 'Error al eliminar',
            description: 'No se pudo eliminar la categoría.',
            variant: 'error',
          });
        }
      });
    }
  };


  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Categorías"
        description="Administra las categorías para clasificar tus transacciones."
        actions={
          <Button onClick={() => navigate('/categories/new')}>
            <Icon name="plus" size="sm" className="mr-2" />
            Nueva Categoría
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">

      <QueryState 
        data={categoriesQuery.data}
        isLoading={categoriesQuery.isLoading}
        isError={categoriesQuery.isError}
        error={categoriesQuery.error}
        emptyTitle="No hay categorías"
        emptyDescription="Comienza creando tu primera categoría."
        emptyIcon="tag"
      >
        {(categories) => (
          <CategoriesTable 
            categories={categories}
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </QueryState>

      </PageContainer.Body>
    </PageContainer>
  );
}
