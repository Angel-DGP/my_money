import { useState } from 'react';
import { useCardBrands, useDeleteCardBrand } from '../api/useCatalogs';
import { Button, Icon, DataTable, type ColumnDef, Dialog, Modal, ModalHeader, ModalFooter } from '@mymoney/ui';
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
      cell: (b) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => navigate(`/catalogs/card-brands/edit/${b.id}`)}>
            <Icon name="pencil" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" className="text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20" aria-label="Eliminar" onClick={() => setBrandToDelete(b)}>
            <Icon name="trash" size="sm" />
          </Button>
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
            emptyMessage="No hay marcas configuradas."
          />
        )}
      </QueryState>

      <Dialog.Root open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <Dialog.Portal>
          <Modal>
            <ModalHeader>
              <Dialog.Title className="text-lg font-semibold text-text-primary">¿Eliminar marca?</Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary mt-2">
                Estás a punto de eliminar la marca "{brandToDelete?.name}". Esta acción no se puede deshacer.
              </Dialog.Description>
            </ModalHeader>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setBrandToDelete(null)} disabled={deleteBrand.isPending}>
                Cancelar
              </Button>
              <Button
                className="bg-error-500 hover:bg-error-600 text-white"
                disabled={deleteBrand.isPending}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!brandToDelete) return;
                  try {
                    await deleteBrand.mutateAsync(brandToDelete.id);
                    setBrandToDelete(null);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                {deleteBrand.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </ModalFooter>
          </Modal>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
