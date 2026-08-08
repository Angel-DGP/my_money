import { useState } from 'react';
import { useInstitutions, useDeleteInstitution } from '../api/useCatalogs';
import { Button, Table, TableBody, TableCell, TableRow, Card, Icon, TableHeader, PageContainer, Dialog, Modal, ModalHeader, ModalFooter } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTableState, DataTableToolbar, SortableHeader, TablePagination } from '@mymoney/ui';
import type { InstitutionDto } from '../../../shared/api/dto/catalogs.dto';

export function InstitutionsTab() {
  const { data: institutions, isLoading, isError, error, refetch } = useInstitutions();
  const deleteInstitution = useDeleteInstitution();
  const navigate = useNavigate();
  const [instToDelete, setInstToDelete] = useState<InstitutionDto | null>(null);

  const {
    search,
    setSearch,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalFiltered,
    paginated,
  } = useTableState<InstitutionDto>({
    data: institutions || [],
    pageSize: 10,
    searchFields: ['name', 'type'],
    defaultSort: { column: 'name', direction: 'asc' },
  });

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
            <div className="space-y-4">
              <DataTableToolbar
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar institución..."
              />

              <Card padding="none" className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell asChild>
                        <th>
                          <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                            Nombre
                          </SortableHeader>
                        </th>
                      </TableCell>
                      <TableCell asChild>
                        <th>
                          <SortableHeader column="type" sort={sort} onToggle={toggleSort}>
                            Tipo
                          </SortableHeader>
                        </th>
                      </TableCell>
                      <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        <th>Acciones</th>
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-text-secondary">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Building2 className="w-8 h-8 text-text-tertiary" />
                            <p>{search ? 'No se encontraron resultados.' : 'No tienes instituciones registradas.'}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((inst: InstitutionDto) => (
                        <TableRow key={inst.id} className="hover:bg-surface-hover transition-colors">
                          <TableCell className="font-medium">{inst.name}</TableCell>
                          <TableCell>{inst.type}</TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => navigate(`/catalogs/institutions/edit/${inst.id}`)}>
                              <Icon name="pencil" size="sm" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20" aria-label="Eliminar" onClick={() => setInstToDelete(inst)}>
                              <Icon name="trash" size="sm" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>

              {totalPages > 1 && (
                <TablePagination
                  page={page}
                  totalPages={totalPages}
                  totalFiltered={totalFiltered}
                  pageSize={10}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </QueryState>

        <Dialog.Root open={!!instToDelete} onOpenChange={(open) => !open && setInstToDelete(null)}>
          <Dialog.Portal>
            <Modal>
              <ModalHeader>
                <Dialog.Title className="text-lg font-semibold text-text-primary">¿Eliminar institución?</Dialog.Title>
                <Dialog.Description className="text-sm text-text-secondary mt-2">
                  Estás a punto de eliminar la institución "{instToDelete?.name}". Esta acción no se puede deshacer.
                </Dialog.Description>
              </ModalHeader>
              <ModalFooter>
                <Button variant="ghost" onClick={() => setInstToDelete(null)} disabled={deleteInstitution.isPending}>
                  Cancelar
                </Button>
                <Button
                  className="bg-error-500 hover:bg-error-600 text-white"
                  disabled={deleteInstitution.isPending}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!instToDelete) return;
                    try {
                      await deleteInstitution.mutateAsync(instToDelete.id);
                      setInstToDelete(null);
                    } catch (error) {
                      console.error("Error al eliminar la institución", error);
                    }
                  }}
                >
                  {deleteInstitution.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </ModalFooter>
            </Modal>
          </Dialog.Portal>
        </Dialog.Root>

      </PageContainer.Body>
    </PageContainer>
  );
}
