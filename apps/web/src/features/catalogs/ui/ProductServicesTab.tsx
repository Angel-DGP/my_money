import { useState } from 'react';
import { useProductServices, useDeleteProductService } from '../api/useCatalogs';
import {
  Button,
  Icon,
  PageContainer,
  AlertDialog,
  DataTable,
  type ColumnDef,
} from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { ProductServiceDrawer } from './ProductServiceDrawer';
import type { ProductServiceDto } from '../../../shared/api/dto/catalogs.dto';

export function ProductServicesTab() {
  const { data: products, isLoading, isError, error, refetch } = useProductServices();
  const deleteProduct = useDeleteProductService();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductServiceDto | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (prod: ProductServiceDto) => {
    setSelectedProduct(prod);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenView = (prod: ProductServiceDto) => {
    setSelectedProduct(prod);
    setIsViewMode(true);
    setDrawerOpen(true);
  };

  const columns: ColumnDef<ProductServiceDto>[] = [
    {
      key: 'name',
      header: 'Nombre / Comercio',
      sortable: true,
      className: 'font-medium',
      cell: (prod) => prod.name,
    },
    {
      key: 'category.name',
      header: 'Categoría por Defecto',
      cell: (prod) =>
        prod.category ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-2 text-xs font-medium text-text-secondary border border-border-subtle">
            {prod.category.name}
          </span>
        ) : (
          <span className="text-text-muted text-xs">Sin categoría</span>
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (prod) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenView(prod);
            }}
            className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-surface-2 rounded-lg transition-colors"
            title="Ver Detalle"
          >
            <Icon name="eye" size="sm" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(prod);
            }}
            className="p-1.5 text-text-muted hover:text-primary-600 hover:bg-surface-2 rounded-lg transition-colors"
            title="Editar"
          >
            <Icon name="edit" size="sm" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setProductToDelete(prod.id);
            }}
            className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageContainer.Header
        title="Productos y Comercios Frecuentes"
        description="Guarda nombres de comercios o servicios (ej. Supermaxi, Uber, Apple) para autocompletar rápidamente tus gastos."
        actions={
          <Button
            onClick={handleOpenCreate}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <Icon name="plus" size="xs" className="mr-1.5" />
            Nuevo Comercio
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        <QueryState
          data={products}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
        >
          {() => (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <DataTable<ProductServiceDto>
                data={products || []}
                columns={columns}
                pageSize={10}
                searchFields={['name']}
                searchPlaceholder="Buscar comercio frecuente..."
                defaultSort={{ column: 'name', direction: 'asc' }}
                onRowClick={(prod) => handleOpenView(prod)}
                emptyMessage="No tienes comercios frecuentes guardados."
              />
            </div>
          )}
        </QueryState>

        {/* Product Drawer */}
        <ProductServiceDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          product={selectedProduct}
          isView={isViewMode}
        />

        {/* Delete Dialog */}
        <AlertDialog
          open={!!productToDelete}
          onOpenChange={(open) => !open && setProductToDelete(null)}
          title="¿Eliminar comercio?"
          description="Estás a punto de eliminar este comercio frecuente de tu lista."
          type="error"
          confirmText="Eliminar"
          isLoading={deleteProduct.isPending}
          onConfirm={async () => {
            if (!productToDelete) return;
            try {
              await deleteProduct.mutateAsync(productToDelete);
              setProductToDelete(null);
            } catch (err) {
              console.error('Error al eliminar comercio', err);
            }
          }}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
