import { useState } from 'react';
import { useProductServices, useDeleteProductService } from '../api/useCatalogs';
import { Button, Icon, PageContainer, AlertDialog, DataTable, type ColumnDef } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductServiceDto } from '../../../shared/api/dto/catalogs.dto';

export function ProductServicesTab() {
  const { data: products, isLoading, isError, error, refetch } = useProductServices();
  const deleteProduct = useDeleteProductService();
  const navigate = useNavigate();
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

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
      cell: (prod) => prod.category ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 text-xs font-medium text-text-secondary">
          {prod.category.name}
        </span>
      ) : '-',
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (prod) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => navigate(`/catalogs/products/${prod.id}/edit`, { state: { isView: true } })} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" onClick={() => navigate(`/catalogs/products/${prod.id}/edit`)} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" onClick={() => setProductToDelete(prod.id)} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageContainer.Header
        title="Productos y Servicios Frecuentes"
        description="Guarda nombres de comercios o servicios (ej. Supermaxi, Uber) para autocompletar rápidamente tus gastos."
        actions={
          <Button onClick={() => navigate('/catalogs/products/new')} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
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
                  searchFields={['name', (prod) => prod.category?.name || '']}
                  searchPlaceholder="Buscar producto o comercio..."
                  defaultSort={{ column: 'name', direction: 'asc' }}
                  onRowClick={(prod) => navigate(`/catalogs/products/${prod.id}/edit`, { state: { isView: true } })}
                  emptyMessage="No tienes productos frecuentes registrados."
                />
              </div>
            )}
          </QueryState>
        </div>
      </PageContainer.Body>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        title="Eliminar Comercio/Producto"
        description="¿Estás seguro de que deseas eliminar este comercio? Esta acción no se puede deshacer."
        type="error"
        confirmText="Sí, eliminar"
        isLoading={deleteProduct.isPending}
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct.mutate(productToDelete, {
              onSuccess: () => setProductToDelete(null)
            });
          }
        }}
      />
    </PageContainer>
  );
}
