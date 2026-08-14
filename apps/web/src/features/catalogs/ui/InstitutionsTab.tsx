import { useState } from 'react';
import { useInstitutions, useDeleteInstitution } from '../api/useCatalogs';
import { Button, Icon, PageContainer, AlertDialog, DataTable, type ColumnDef } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { InstitutionDrawer } from './InstitutionDrawer';
import type { InstitutionDto } from '../../../shared/api/dto/catalogs.dto';

const TYPE_LABELS: Record<string, string> = {
  BANK: 'Banco',
  WALLET: 'Billetera Digital',
  COOP: 'Cooperativa',
  OTHER: 'Otro',
};

export function InstitutionsTab() {
  const { data: institutions, isLoading, isError, error, refetch } = useInstitutions();
  const deleteInstitution = useDeleteInstitution();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<InstitutionDto | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [instToDelete, setInstToDelete] = useState<InstitutionDto | null>(null);

  const handleOpenCreate = () => {
    setSelectedInst(null);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (inst: InstitutionDto) => {
    setSelectedInst(inst);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenView = (inst: InstitutionDto) => {
    setSelectedInst(inst);
    setIsViewMode(true);
    setDrawerOpen(true);
  };

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
      cell: (inst) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-text-secondary border border-border-subtle">
          {TYPE_LABELS[inst.type] || inst.type}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (inst) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenView(inst);
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
              handleOpenEdit(inst);
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
              setInstToDelete(inst);
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
        title="Bancos e Instituciones"
        description="Administra los bancos y billeteras donde tienes cuentas y tarjetas."
        actions={
          <Button onClick={handleOpenCreate} variant="primary" size="sm" className="px-3 sm:px-4" aria-label="Nueva Institución">
            <Icon name="plus" size="sm" className="sm:mr-2" />
            <span className="hidden sm:inline">Nueva Institución</span>
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
                onRowClick={(inst) => handleOpenView(inst)}
                emptyMessage="No tienes instituciones registradas."
              />
            </div>
          )}
        </QueryState>

        {/* Responsive Drawer */}
        <InstitutionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          institution={selectedInst}
          isView={isViewMode}
        />

        {/* Delete Dialog */}
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
            } catch (err) {
              console.error('Error al eliminar la institución', err);
            }
          }}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
