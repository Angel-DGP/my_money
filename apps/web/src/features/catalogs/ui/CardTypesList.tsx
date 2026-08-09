import { useState } from 'react';
import { useCardTypes, useDeleteCardType } from '../api/useCatalogs';
import { Icon, DataTable, type ColumnDef, AlertDialog } from '@mymoney/ui';
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
      sticky: 'right',
      cell: (t) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => navigate(`/catalogs/card-types/edit/${t.id}`, { state: { isView: true } })} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" onClick={() => navigate(`/catalogs/card-types/edit/${t.id}`)} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" onClick={() => setTypeToDelete(t)} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
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
            onRowClick={(t) => navigate(`/catalogs/card-types/edit/${t.id}`, { state: { isView: true } })}
            emptyMessage="No hay tipos configurados."
          />
        )}
      </QueryState>

      <AlertDialog
        open={!!typeToDelete}
        onOpenChange={(open) => !open && setTypeToDelete(null)}
        title="¿Eliminar tipo?"
        description={`Estás a punto de eliminar el tipo "${typeToDelete?.name}". Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Eliminar"
        isLoading={deleteType.isPending}
        onConfirm={async () => {
          if (!typeToDelete) return;
          try {
            await deleteType.mutateAsync(typeToDelete.id);
            setTypeToDelete(null);
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </div>
  );
}
