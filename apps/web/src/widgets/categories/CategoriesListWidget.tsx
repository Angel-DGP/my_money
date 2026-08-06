import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoriesQuery, useUpdateCategory, useDeleteCategory } from '@entities/category';
import type { Category, UpdateCategoryDto } from '@entities/category';
import { CategoriesTable } from '@features/categories';
import { CategoryForm } from '@features/categories';
import { Dialog, Button, Icon, toast, PageContainer } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';

export function CategoriesListWidget() {
  const navigate = useNavigate();
  const categoriesQuery = useCategoriesQuery();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
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

  const handleEditSubmit = (data: UpdateCategoryDto) => {
    if (!editingCategory) return;
    updateCategory.mutate({ id: editingCategory.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        toast({
          title: 'Categoría actualizada',
          description: 'Los cambios se han guardado exitosamente.',
          variant: 'success',
        });
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

      {/* Dialog solo para EDICIÓN */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsEditDialogOpen(false)} />
            <div className="relative z-50 grid w-full max-w-lg gap-4 rounded-xl border border-border-subtle bg-background p-6 shadow-lg sm:rounded-2xl">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  Editar Categoría
                </Dialog.Title>
                <Dialog.Description className="text-sm text-text-secondary">
                  Modifica el nombre o tipo de la categoría.
                </Dialog.Description>
              </div>
              <div className="mt-4">
                <CategoryForm 
                  initialData={editingCategory} 
                  onSubmit={handleEditSubmit as any} 
                  onCancel={() => setIsEditDialogOpen(false)}
                  isLoading={updateCategory.isPending}
                />
              </div>
              <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <Icon name="x" size="sm" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
      </PageContainer.Body>
    </PageContainer>
  );
}
