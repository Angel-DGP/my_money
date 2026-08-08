import { useState } from 'react';
import { useCardBrands, useDeleteCardBrand } from '../api/useCatalogs';
import { Button, Icon, DataTable, type ColumnDef, AlertDialog } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { useNavigate } from 'react-router-dom';
import type { CardBrandDto } from '../../../shared/api/dto/catalogs.dto';

export function CardBrandsList() {
  const { data: brands, isLoading, isError, error, refetch } = useCardBrands();
  const deleteBrand = useDeleteCardBrand();
  const navigate = useNavigate();
  
  const [brandToDelete, setBrandToDelete] = useState<CardBrandDto | null>(null);

  const columns: ColumnDef<CardBrandDto>[] = [
    {
      key: 'name',
      header: 'Nombre de Marca',
      sortable: true,
      className: 'font-medium',
      cell: (b) => b.name,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (b) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => navigate(`/catalogs/card-brands/edit/${b.id}`, { state: { isView: true } })} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" onClick={() => navigate(`/catalogs/card-brands/edit/${b.id}`)} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" onClick={() => setBrandToDelete(b)} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">

      <QueryState data={brands} isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {() => (
          <DataTable<CardBrandDto>
            data={brands || []}
            columns={columns}
            pageSize={10}
            searchFields={['name']}
            searchPlaceholder="Buscar marca..."
            defaultSort={{ column: 'name', direction: 'asc' }}
            onRowClick={(b) => navigate(`/catalogs/card-brands/edit/${b.id}`, { state: { isView: true } })}
            emptyMessage="No hay marcas configuradas."
          />
        )}
      </QueryState>

      <AlertDialog
        open={!!brandToDelete}
        onOpenChange={(open) => !open && setBrandToDelete(null)}
        title="¿Eliminar marca?"
        description={`Estás a punto de eliminar la marca "${brandToDelete?.name}". Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Eliminar"
        isLoading={deleteBrand.isPending}
        onConfirm={async () => {
          if (!brandToDelete) return;
          try {
            await deleteBrand.mutateAsync(brandToDelete.id);
            setBrandToDelete(null);
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </div>
  );
}
