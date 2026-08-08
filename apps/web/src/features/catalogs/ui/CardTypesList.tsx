import { useState } from 'react';
import { useCardTypes, useDeleteCardType } from '../api/useCatalogs';
import { Button, Icon, DataTable, type ColumnDef, Dialog, Modal, ModalHeader, ModalFooter } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { useNavigate } from 'react-router-dom';
import type { CardTypeDto } from '../../../shared/api/dto/catalogs.dto';

export function CardTypesList() {
  const { data: types, isLoading, isError, error, refetch } = useCardTypes();
  const deleteType = useDeleteCardType();
  const navigate = useNavigate();
  
  const [typeToDelete, setTypeToDelete] = useState<CardTypeDto | null>(null);

  const columns: ColumnDef<CardTypeDto>[] = [
    {
      key: 'name',
      header: 'Nombre del Tipo',
      sortable: true,
      className: 'font-medium',
      cell: (t) => t.name,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      cell: (t) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => navigate(`/catalogs/card-types/edit/${t.id}`)}>
            <Icon name="pencil" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" className="text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20" aria-label="Eliminar" onClick={() => setTypeToDelete(t)}>
            <Icon name="trash" size="sm" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">

      <QueryState data={types} isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {() => (
          <DataTable<CardTypeDto>
            data={types || []}
            columns={columns}
            pageSize={10}
            searchFields={['name']}
            searchPlaceholder="Buscar tipo..."
            defaultSort={{ column: 'name', direction: 'asc' }}
            emptyMessage="No hay tipos configurados."
          />
        )}
      </QueryState>

      <Dialog.Root open={!!typeToDelete} onOpenChange={(open) => !open && setTypeToDelete(null)}>
        <Dialog.Portal>
          <Modal>
            <ModalHeader>
              <Dialog.Title className="text-lg font-semibold text-text-primary">¿Eliminar tipo?</Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary mt-2">
                Estás a punto de eliminar el tipo "{typeToDelete?.name}". Esta acción no se puede deshacer.
              </Dialog.Description>
            </ModalHeader>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setTypeToDelete(null)} disabled={deleteType.isPending}>
                Cancelar
              </Button>
              <Button
                className="bg-error-500 hover:bg-error-600 text-white"
                disabled={deleteType.isPending}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!typeToDelete) return;
                  try {
                    await deleteType.mutateAsync(typeToDelete.id);
                    setTypeToDelete(null);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                {deleteType.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </ModalFooter>
          </Modal>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
