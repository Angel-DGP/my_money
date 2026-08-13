import { useState, forwardRef, useImperativeHandle } from 'react';
import { useCardBrands, useDeleteCardBrand } from '../api/useCatalogs';
import { Icon, DataTable, type ColumnDef, AlertDialog } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { CardBrandDrawer } from './CardBrandDrawer';
import type { CardBrandDto } from '../../../shared/api/dto/catalogs.dto';

export interface CardBrandsListRef {
  openCreate: () => void;
}

export const CardBrandsList = forwardRef<CardBrandsListRef>((_, ref) => {
  const { data: brands, isLoading, isError, error, refetch } = useCardBrands();
  const deleteBrand = useDeleteCardBrand();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<CardBrandDto | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<CardBrandDto | null>(null);

  useImperativeHandle(ref, () => ({
    openCreate: () => {
      setSelectedBrand(null);
      setIsViewMode(false);
      setDrawerOpen(true);
    },
  }));

  const handleOpenEdit = (brand: CardBrandDto) => {
    setSelectedBrand(brand);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenView = (brand: CardBrandDto) => {
    setSelectedBrand(brand);
    setIsViewMode(true);
    setDrawerOpen(true);
  };

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
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenView(b);
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
              handleOpenEdit(b);
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
              setBrandToDelete(b);
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
            onRowClick={(b) => handleOpenView(b)}
            emptyMessage="No hay marcas configuradas."
          />
        )}
      </QueryState>

      {/* Drawer */}
      <CardBrandDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        brand={selectedBrand}
        isView={isViewMode}
      />

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
});

CardBrandsList.displayName = 'CardBrandsList';
