import { useCards } from '../api/useCatalogs';
import { Button, Table, TableBody, TableCell, TableRow, Card, Tabs, TabsList, TabsTrigger, TabsContent, Icon, TableHeader } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardBrandsList } from './CardBrandsList';
import { CardTypesList } from './CardTypesList';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';
import type { CardDto } from '../../../shared/api/dto/catalogs.dto';

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Crédito', value: 'CREDIT' },
  { label: 'Débito', value: 'DEBIT' },
];

export function CardsTab() {
  const { data: cards, isLoading, isError, error, refetch } = useCards();
  const navigate = useNavigate();

  const {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalFiltered,
    paginated,
  } = useTableState<CardDto>({
    data: cards || [],
    pageSize: 10,
    searchFields: ['name', (c) => c.institution?.name || '', (c) => c.brand?.name || ''],
    filterField: (c, f) => {
      const typeName = c.type?.name?.toLowerCase() || '';
      if (f === 'CREDIT') return typeName.includes('crédito') || typeName.includes('credito') || typeName.includes('credit');
      if (f === 'DEBIT') return typeName.includes('débito') || typeName.includes('debito') || typeName.includes('debit');
      return true;
    },
    defaultSort: { column: 'name', direction: 'asc' },
  });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Módulo de Tarjetas</h3>
          <p className="text-sm text-text-secondary">Registra tus tarjetas y gestiona las redes y tipos disponibles.</p>
        </div>
      </div>

      <Tabs defaultValue="cards">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="cards">Tarjetas</TabsTrigger>
          <TabsTrigger value="brands">Redes (Marcas)</TabsTrigger>
          <TabsTrigger value="types">Tipos</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="pt-2">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <DataTableToolbar
              search={search}
              onSearchChange={setSearch}
              filters={FILTERS}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              placeholder="Buscar tarjeta, banco o red..."
              className="flex-1"
            />
            <Button onClick={() => navigate('/catalogs/cards/new')} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarjeta
            </Button>
          </div>

          <QueryState
            data={cards}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
          >
            {() => (
              <div className="space-y-4">
                <Card padding="none" className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell asChild>
                          <th>
                            <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                              Alias
                            </SortableHeader>
                          </th>
                        </TableCell>
                        <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                          <th>Banco</th>
                        </TableCell>
                        <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                          <th>Red</th>
                        </TableCell>
                        <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                          <th>Terminación</th>
                        </TableCell>
                        <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                          <th>Tipo</th>
                        </TableCell>
                        <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                          <th>Acciones</th>
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-text-secondary">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <CreditCard className="w-8 h-8 text-text-tertiary" />
                              <p>{search || activeFilter !== 'all' ? 'No se encontraron resultados.' : 'No tienes tarjetas guardadas.'}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginated.map((c) => (
                          <TableRow key={c.id} className="hover:bg-surface-hover transition-colors">
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>{c.institution?.name}</TableCell>
                            <TableCell>{c.brand?.name}</TableCell>
                            <TableCell>**** {c.last_four}</TableCell>
                            <TableCell>{c.type?.name}</TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" aria-label="Editar"><Icon name="pencil" size="sm" /></Button>
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
        </TabsContent>

        <TabsContent value="brands">
          <CardBrandsList />
        </TabsContent>

        <TabsContent value="types">
          <CardTypesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
