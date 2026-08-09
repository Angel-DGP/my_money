import { useState } from 'react';
import { useInstitutions, useDeleteInstitution } from '../api/useCatalogs';
import { Button, Icon, PageContainer, AlertDialog, DataTable, type ColumnDef } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { InstitutionDto } from '../../../shared/api/dto/catalogs.dto';

export function InstitutionsTab() {
  const { data: institutions, isLoading, isError, error, refetch } = useInstitutions();
  const deleteInstitution = useDeleteInstitution();
  const navigate = useNavigate();
  const [instToDelete, setInstToDelete] = useState<InstitutionDto | null>(null);

  const columns: ColumnDef<InstitutionDto>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      className: 'font-medium',
      cell: (inst) => inst.name,
    },
    {
      key: 'type',
      header: 'Tipo',
      sortable: true,
      cell: (inst) => inst.type,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (inst) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/catalogs/institutions/edit/${inst.id}`, { state: { isView: true } }); }} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/catalogs/institutions/edit/${inst.id}`); }} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setInstToDelete(inst); }} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageContainer.Header
        title="Bancos e Instituciones"
        description="Administra los bancos donde tienes cuentas y tarjetas."
        actions={
          <Button onClick={() => navigate('/catalogs/institutions/new')} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Institución
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        <QueryState
          data={institutions}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
        >
          {() => (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <DataTable<InstitutionDto>
                data={institutions || []}
                columns={columns}
                pageSize={10}
                searchFields={['name', 'type']}
                searchPlaceholder="Buscar institución..."
                defaultSort={{ column: 'name', direction: 'asc' }}
                onRowClick={(inst) => navigate(`/catalogs/institutions/edit/${inst.id}`, { state: { isView: true } })}
                emptyMessage="No tienes instituciones registradas."
              />
            </div>
          )}
        </QueryState>

        <AlertDialog
          open={!!instToDelete}
          onOpenChange={(open) => !open && setInstToDelete(null)}
          title="¿Eliminar institución?"
          description={`Estás a punto de eliminar la institución "${instToDelete?.name}". Esta acción no se puede deshacer.`}
          type="error"
          confirmText="Eliminar"
          isLoading={deleteInstitution.isPending}
          onConfirm={async () => {
            if (!instToDelete) return;
            try {
              await deleteInstitution.mutateAsync(instToDelete.id);
              setInstToDelete(null);
            } catch (error) {
              console.error("Error al eliminar la institución", error);
            }
          }}
        />

      </PageContainer.Body>
    </PageContainer>
  );
}
