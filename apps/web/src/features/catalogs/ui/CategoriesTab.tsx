import { useState } from 'react';
import { useCategoriesQuery, useDeleteCategory, type Category } from '@entities/category';
import { Button, Icon, PageContainer, AlertDialog, toast } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { CategoriesTable, CategoryDrawer } from '../../categories';

export function CategoriesTab() {
  const categoriesQuery = useCategoriesQuery();
  const deleteCategory = useDeleteCategory();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenView = (cat: Category) => {
    setSelectedCategory(cat);
    setIsViewMode(true);
    setDrawerOpen(true);
  };

  const handleDelete = (cat: Category) => {
    if (cat.is_system) {
      toast({
        title: 'Acción no permitida',
        description: 'No puedes eliminar una categoría del sistema.',
        variant: 'warning',
      });
      return;
    }
    setCategoryToDelete(cat);
  };

  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Categorías"
        description="Administra las categorías y subcategorías para clasificar tus transacciones."
        actions={
          <Button onClick={handleOpenCreate}>
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
          emptyDescription="Comienza creando tu primera categoría personalizada."
          emptyIcon="tag"
          onRetry={categoriesQuery.refetch}
        >
          {(categories) => (
            <CategoriesTable
              categories={categories}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
        </QueryState>
      </PageContainer.Body>

      {/* ─── DRAWER DE CATEGORÍA (Creación / Edición / Detalle) ─────────────── */}
      <CategoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        category={selectedCategory}
        isView={isViewMode}
      />

      {/* ─── DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN ──────────────────────────── */}
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
                  description: 'La categoría ha sido eliminada con éxito.',
                  variant: 'success',
                });
              },
              onError: () => {
                toast({
                  title: 'Error al eliminar',
                  description: 'No se pudo eliminar la categoría.',
                  variant: 'error',
                });
              },
            });
          }
        }}
      />
    </PageContainer>
  );
}
