import { useProductServices } from '../api/useCatalogs';
import { Button, Table, TableBody, TableCell, TableRow, Card, Icon, TableHeader } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTableState, DataTableToolbar, SortableHeader, TablePagination } from '@mymoney/ui';
import type { ProductServiceDto } from '../../../shared/api/dto/catalogs.dto';

export function ProductServicesTab() {
  const { data: products, isLoading, isError, error, refetch } = useProductServices();
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
  } = useTableState<ProductServiceDto>({
    data: products || [],
    pageSize: 10,
    searchFields: ['name'],
    defaultSort: { column: 'name', direction: 'asc' },
  });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Productos y Servicios Frecuentes</h3>
          <p className="text-sm text-text-secondary">Guarda nombres de comercios o servicios (ej. Supermaxi, Uber) para autocompletar rápidamente tus gastos y seguir su historial.</p>
        </div>
        <Button onClick={() => navigate('/catalogs/products/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <QueryState
        data={products}
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
              placeholder="Buscar producto o comercio..."
            />

            <Card padding="none" className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell asChild>
                      <th>
                        <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                          Nombre / Comercio
                        </SortableHeader>
                      </th>
                    </TableCell>
                    <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      <th>Categoría por Defecto</th>
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
                          <ShoppingBag className="w-8 h-8 text-text-tertiary" />
                          <p>{search ? 'No se encontraron resultados.' : 'No tienes productos frecuentes registrados.'}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((prod: ProductServiceDto) => (
                      <TableRow key={prod.id} className="hover:bg-surface-hover transition-colors">
                        <TableCell className="font-medium">{prod.name}</TableCell>
                        <TableCell className="text-text-secondary">...</TableCell>
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
