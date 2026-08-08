import { useNavigate } from 'react-router-dom';
import { useCategoriesQuery, useDeleteCategory } from '@entities/category';
import type { Category } from '@entities/category';
import { CategoriesTable } from '@features/categories';
import { Button, Icon, toast, PageContainer, AlertDialog } from '@mymoney/ui';
import { useState } from 'react';
import { QueryState } from '@shared/ui/QueryState';

export function CategoriesListWidget() {
  const navigate = useNavigate();
  const categoriesQuery = useCategoriesQuery();
  const deleteCategory = useDeleteCategory();
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleView = (category: Category) => {
    navigate(`/categories/edit/${category.id}`, { state: { isView: true } });
  };

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
    setCategoryToDelete(category);
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
            onView={handleView}
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </QueryState>

      </PageContainer.Body>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Eliminar Categoría"
        description={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Sí, eliminar"
        isLoading={deleteCategory.isPending}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory.mutate(categoryToDelete.id, {
              onSuccess: () => {
                setCategoryToDelete(null);
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
        }}
      />
    </PageContainer>
  );
}
