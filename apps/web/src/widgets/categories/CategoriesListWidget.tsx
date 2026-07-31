import React, { useState } from 'react';
import { useCategoriesQuery, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../entities/category/model';
import { CategoriesTable } from '../../features/categories/ui/CategoriesTable';
import { CategoryForm } from '../../features/categories/ui/CategoryForm';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../../entities/category/types/category.types';
import { Dialog, Button, Icon, toast } from '@mymoney/ui';
import { QueryState } from '../../shared/ui/QueryState';

export function CategoriesListWidget() {
  const categoriesQuery = useCategoriesQuery();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
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

  const handleSubmit = (data: CreateCategoryDto | UpdateCategoryDto) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data: data as UpdateCategoryDto }, {
        onSuccess: () => {
          setIsDialogOpen(false);
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
    } else {
      createCategory.mutate(data as CreateCategoryDto, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({
            title: 'Categoría creada',
            description: 'La categoría se ha creado exitosamente.',
            variant: 'success',
          });
        },
        onError: () => {
          toast({
            title: 'Error al crear',
            description: 'No se pudo crear la categoría.',
            variant: 'error',
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-base">Categorías</h2>
          <p className="text-sm text-text-muted mt-1">Administra las categorías para clasificar tus transacciones.</p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="plus" size="sm" className="mr-2" />
          Nueva Categoría
        </Button>
      </div>

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

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsDialogOpen(false)} />
            <div className="relative z-50 grid w-full max-w-lg gap-4 rounded-xl border border-border-subtle bg-bg-base p-6 shadow-lg sm:rounded-2xl">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-text-muted">
                  {editingCategory ? 'Modifica el nombre o tipo de la categoría.' : 'Agrega una nueva categoría para organizar tu dinero.'}
                </Dialog.Description>
              </div>
              <div className="mt-4">
                <CategoryForm 
                  initialData={editingCategory || undefined} 
                  onSubmit={handleSubmit} 
                  onCancel={() => setIsDialogOpen(false)}
                  isLoading={createCategory.isPending || updateCategory.isPending}
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
    </div>
  );
}
