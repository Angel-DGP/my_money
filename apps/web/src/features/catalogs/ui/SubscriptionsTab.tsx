import { useSubscriptions } from '../api/useCatalogs';
import { Button, Table, TableBody, TableCell, TableRow, Card, Icon, TableHeader } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export function SubscriptionsTab() {
  const { data: subscriptions, isLoading, isError, error, refetch } = useSubscriptions();
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
  } = useTableState<SubscriptionDto>({
    data: subscriptions || [],
    pageSize: 10,
    searchFields: ['name'],
    defaultSort: { column: 'name', direction: 'asc' },
    sortFn: (a, b, col, dir) => {
      let valA: any = '';
      let valB: any = '';

      if (col === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (col === 'amount') {
        valA = Number(a.amount);
        valB = Number(b.amount);
        return dir === 'asc' ? valA - valB : valB - valA;
      } else if (col === 'next_billing_date') {
        valA = new Date(a.next_billing_date).getTime();
        valB = new Date(b.next_billing_date).getTime();
        return dir === 'asc' ? valA - valB : valB - valA;
      }

      const cmp = String(valA).localeCompare(String(valB));
      return dir === 'asc' ? cmp : -cmp;
    }
  });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Suscripciones</h3>
          <p className="text-sm text-text-secondary">Administra tus pagos recurrentes y recibe alertas antes de que te cobren.</p>
        </div>
        <Button onClick={() => navigate('/catalogs/subscriptions/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Suscripción
        </Button>
      </div>

      <QueryState
        data={subscriptions}
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
              placeholder="Buscar suscripción..."
            />

            <Card padding="none" className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell asChild>
                      <th>
                        <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                          Servicio
                        </SortableHeader>
                      </th>
                    </TableCell>
                    <TableCell asChild>
                      <th>
                        <SortableHeader column="amount" sort={sort} onToggle={toggleSort}>
                          Monto
                        </SortableHeader>
                      </th>
                    </TableCell>
                    <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      <th>Ciclo</th>
                    </TableCell>
                    <TableCell asChild>
                      <th>
                        <SortableHeader column="next_billing_date" sort={sort} onToggle={toggleSort}>
                          Próximo Cobro
                        </SortableHeader>
                      </th>
                    </TableCell>
                    <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      <th>Tarjeta Asoc.</th>
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
                          <Repeat className="w-8 h-8 text-text-tertiary" />
                          <p>{search ? 'No se encontraron resultados.' : 'No tienes suscripciones registradas.'}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-surface-hover transition-colors">
                        <TableCell className="font-medium">{sub.name}</TableCell>
                        <TableCell>{formatCurrency(Number(sub.amount), sub.currency)}</TableCell>
                        <TableCell>{sub.billing_cycle}</TableCell>
                        <TableCell>{new Date(sub.next_billing_date).toLocaleDateString()}</TableCell>
                        <TableCell>{sub.card ? `${sub.card.brand?.name || ''} **${sub.card.last_four}` : '-'}</TableCell>
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
