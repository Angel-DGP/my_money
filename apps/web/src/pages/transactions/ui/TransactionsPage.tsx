import { useTransactionsQuery, useDeleteTransaction, type Transaction } from '@entities/transaction';
import { useAccountsQuery } from '@entities/account';
import { useCategoriesQuery } from '@entities/category';
import { TransactionsTable, TransactionDrawer } from '@features/transactions';
import { Button, Icon, PageContainer, Text, AlertDialog, Select, Badge } from '@mymoney/ui';
import { useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const accountIdParam = searchParams.get('accountId') || searchParams.get('account_id') || '';
  const typeParam = searchParams.get('type') || '';
  const categoryIdParam = searchParams.get('categoryId') || searchParams.get('category_id') || '';

  const { data: accounts } = useAccountsQuery();
  const { data: categories } = useCategoriesQuery();

  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    transaction: Transaction | null;
    isView: boolean;
  }>({
    open: false,
    transaction: null,
    isView: false,
  });

  const queryParams = useMemo(() => ({
    limit: 100,
    account_id: accountIdParam || undefined,
    type: typeParam || undefined,
    category_id: categoryIdParam || undefined,
  }), [accountIdParam, typeParam, categoryIdParam]);

  const { data, isLoading, isError } = useTransactionsQuery(queryParams);
  const deleteTransaction = useDeleteTransaction();
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const handleAccountChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'all') {
      newParams.set('accountId', val);
    } else {
      newParams.delete('accountId');
      newParams.delete('account_id');
    }
    setSearchParams(newParams);
  };

  const handleTypeChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'all') {
      newParams.set('type', val);
    } else {
      newParams.delete('type');
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'all') {
      newParams.set('categoryId', val);
    } else {
      newParams.delete('categoryId');
      newParams.delete('category_id');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeAccount = accounts?.find(a => a.id === accountIdParam);
  const hasActiveFilters = Boolean(accountIdParam || typeParam || categoryIdParam);

  const handleOpenCreate = () => {
    setDrawerState({ open: true, transaction: null, isView: false });
  };

  const handleView = (tx: Transaction) => {
    setDrawerState({ open: true, transaction: tx, isView: true });
  };

  const handleEdit = (tx: Transaction) => {
    setDrawerState({ open: true, transaction: tx, isView: false });
  };

  const handleDeleteConfirm = async () => {
    if (!txToDelete) return;
    try {
      await deleteTransaction.mutateAsync(txToDelete.id);
      setTxToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction', error);
    }
  };

  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Transacciones"
        description={activeAccount ? `Movimientos de la cuenta: ${activeAccount.name}` : "Historial completo de tus movimientos"}
        actions={
          <Button onClick={handleOpenCreate} aria-label="Nueva Transacción" size="sm" className="px-3 sm:px-4">
            <Icon name="plus" size="sm" className="sm:mr-2" />
            <span className="hidden sm:inline">Nueva Transacción</span>
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        {/* ─── BARRA DE FILTROS ──────────────────────────────────────────────── */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 mb-6 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Select
                id="filter-account"
                label="Cuenta"
                value={accountIdParam || 'all'}
                onChange={(e) => handleAccountChange(e.target.value)}
              >
                <option value="all">Todas las cuentas</option>
                {accounts?.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                id="filter-type"
                label="Tipo de Movimiento"
                value={typeParam || 'all'}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="INCOME">Ingresos</option>
                <option value="EXPENSE">Gastos</option>
                <option value="TRANSFER">Transferencias</option>
              </Select>
            </div>

            <div>
              <Select
                id="filter-category"
                label="Categoría"
                value={categoryIdParam || 'all'}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border-subtle/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Filtros activos:</span>
                {activeAccount && (
                  <Badge variant="primary" size="sm">
                    Cuenta: {activeAccount.name}
                  </Badge>
                )}
                {typeParam && (
                  <Badge variant="neutral" size="sm">
                    Tipo: {typeParam === 'INCOME' ? 'Ingreso' : typeParam === 'EXPENSE' ? 'Gasto' : 'Transferencia'}
                  </Badge>
                )}
                {categoryIdParam && categories && (
                  <Badge variant="neutral" size="sm">
                    Categoría: {categories.find(c => c.id === categoryIdParam)?.name || 'Seleccionada'}
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-primary-500 hover:text-primary-600 font-medium hover:underline flex items-center gap-1"
              >
                <Icon name="x" size="xs" /> Limpiar filtros
              </button>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-error-500">Error al cargar transacciones</div>
        ) : data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
              <Icon name="repeat" size="lg" className="text-text-muted" />
            </div>
            <Text weight="medium" className="mb-2">No hay transacciones</Text>
            <Text variant="muted" className="max-w-sm">No has registrado ningún movimiento. Cuando lo hagas, aparecerán aquí.</Text>
          </div>
        ) : (
          <>
            <TransactionsTable 
              transactions={data || []}
              onView={handleView} 
              onEdit={handleEdit}
              onDelete={(tx) => setTxToDelete(tx)}
            />

            <AlertDialog
              open={!!txToDelete}
              onOpenChange={(open) => !open && setTxToDelete(null)}
              title="Eliminar Transacción"
              description={`¿Estás seguro de que deseas eliminar esta transacción por ${txToDelete?.amount.value}?`}
              type="error"
              confirmText="Eliminar"
              onConfirm={handleDeleteConfirm}
              isLoading={deleteTransaction.isPending}
            />
          </>
        )}
      </PageContainer.Body>

      {/* ─── DRAWER DE TRANSACCIONES (Crear / Editar / Recibo) ──────────────── */}
      <TransactionDrawer
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState((prev) => ({ ...prev, open }))}
        transaction={drawerState.transaction}
        initialViewMode={drawerState.isView}
      />
    </PageContainer>
  );
}

