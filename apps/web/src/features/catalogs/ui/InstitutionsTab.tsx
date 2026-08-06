import { useInstitutions } from '../api/useCatalogs';
import { Button, Table, TableBody, TableCell, TableRow, Card, Icon, TableHeader } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';
import type { InstitutionDto } from '../../../shared/api/dto/catalogs.dto';

export function InstitutionsTab() {
  const { data: institutions, isLoading, isError, error, refetch } = useInstitutions();
  const navigate = useNavigate();

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
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Bancos e Instituciones</h3>
          <p className="text-sm text-text-secondary">Gestiona los bancos y billeteras de donde provienen tus cuentas.</p>
        </div>
        <Button onClick={() => navigate('/catalogs/institutions/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Institución
        </Button>
      </div>

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
                    paginated.map((inst) => (
                      <TableRow key={inst.id} className="hover:bg-surface-hover transition-colors">
                        <TableCell className="font-medium">{inst.name}</TableCell>
                        <TableCell>{inst.type}</TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" aria-label="Editar">
                            <Icon name="pencil" size="sm" />
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
    </div>
  );
}
