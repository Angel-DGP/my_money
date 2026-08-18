import { useTransactionsQuery, useDeleteTransaction, type Transaction } from '@entities/transaction';
import { useAccountsQuery } from '@entities/account';
import { useCategoriesQuery } from '@entities/category';
import { TransactionsTable, TransactionDrawer } from '@features/transactions';
import { CategorySelect } from '@features/categories';
import { Button, Icon, PageContainer, Text, AlertDialog, Select, Badge, DatePicker } from '@mymoney/ui';
import { useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { getEcuadorTodayString, formatDateEC } from '@shared/utils/date';

const DATE_PRESET_LABELS: Record<string, string> = {
  today: 'Hoy',
  this_week: 'Esta semana',
  this_month: 'Este mes',
  last_month: 'Mes anterior',
  this_year: 'Este año',
  custom: 'Personalizado',
};

function getDatePresetRange(preset: string): { start: string; end: string } | null {
  const todayStr = getEcuadorTodayString();
  const parts = todayStr.split('-');
  const year = parseInt(parts[0] ?? '2026', 10);
  const month = parseInt(parts[1] ?? '1', 10);

  if (preset === 'today') {
    return { start: todayStr, end: todayStr };
  }
  if (preset === 'this_week') {
    const d = new Date(`${todayStr}T12:00:00-05:00`);
    const dayOfWeek = d.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mon = new Date(d);
    mon.setDate(d.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const formatD = (dateObj: Date) => {
      const yy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    };
    return { start: formatD(mon), end: formatD(sun) };
  }
  if (preset === 'this_month') {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  }
  if (preset === 'last_month') {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const start = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(prevYear, prevMonth, 0).getDate();
    const end = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  }
  if (preset === 'this_year') {
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }
  return null;
}

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const accountIdParam = searchParams.get('accountId') || searchParams.get('account_id') || '';
  const typeParam = searchParams.get('type') || '';
  const categoryIdParam = searchParams.get('categoryId') || searchParams.get('category_id') || '';
  const startDateParam = searchParams.get('startDate') || searchParams.get('start_date') || '';
  const endDateParam = searchParams.get('endDate') || searchParams.get('end_date') || '';
  const datePresetParam = searchParams.get('datePreset') || (startDateParam || endDateParam ? 'custom' : 'all');

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
    start_date: startDateParam || undefined,
    end_date: endDateParam || undefined,
  }), [accountIdParam, typeParam, categoryIdParam, startDateParam, endDateParam]);

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

  const handleDatePresetChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val === 'all') {
      newParams.delete('datePreset');
      newParams.delete('startDate');
      newParams.delete('start_date');
      newParams.delete('endDate');
      newParams.delete('end_date');
    } else if (val === 'custom') {
      newParams.set('datePreset', 'custom');
    } else {
      const range = getDatePresetRange(val);
      if (range) {
        newParams.set('datePreset', val);
        newParams.set('startDate', range.start);
        newParams.set('endDate', range.end);
        newParams.delete('start_date');
        newParams.delete('end_date');
      }
    }
    setSearchParams(newParams);
  };

  const handleStartDateChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('startDate', val);
      newParams.set('datePreset', 'custom');
      newParams.delete('start_date');
    } else {
      newParams.delete('startDate');
      newParams.delete('start_date');
    }
    setSearchParams(newParams);
  };

  const handleEndDateChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('endDate', val);
      newParams.set('datePreset', 'custom');
      newParams.delete('end_date');
    } else {
      newParams.delete('endDate');
      newParams.delete('end_date');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeAccount = accounts?.find(a => a.id === accountIdParam);
  const hasActiveDate = Boolean(startDateParam || endDateParam || (datePresetParam && datePresetParam !== 'all'));
  const hasActiveFilters = Boolean(accountIdParam || typeParam || categoryIdParam || hasActiveDate);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <CategorySelect
                id="filter-category"
                label="Categoría"
                value={categoryIdParam || 'none'}
                onChange={(val) => handleCategoryChange(val === 'none' ? 'all' : val)}
                allowNone
                noneLabel="Todas las categorías"
                placeholder="Todas las categorías"
                showTransferOption={typeParam === 'all' || typeParam === 'TRANSFER' || !typeParam}
                filterType={typeParam === 'INCOME' || typeParam === 'EXPENSE' ? typeParam : 'ALL'}
              />
            </div>

            <div>
              <Select
                id="filter-date-preset"
                label="Fecha"
                value={datePresetParam || 'all'}
                onChange={(e) => handleDatePresetChange(e.target.value)}
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="this_week">Esta semana</option>
                <option value="this_month">Este mes</option>
                <option value="last_month">Mes anterior</option>
                <option value="this_year">Este año</option>
                <option value="custom">Personalizado...</option>
              </Select>
            </div>
          </div>

          {/* Rango de fechas personalizado */}
          {datePresetParam === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle/50 animate-in fade-in duration-200">
              <DatePicker
                id="filter-start-date"
                label="Desde"
                value={startDateParam}
                onChange={handleStartDateChange}
                placeholder="Selecciona fecha inicio"
              />
              <DatePicker
                id="filter-end-date"
                label="Hasta"
                value={endDateParam}
                onChange={handleEndDateChange}
                placeholder="Selecciona fecha fin"
              />
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border-subtle/50 text-xs">
              <div className="flex items-center flex-wrap gap-2">
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
                {categoryIdParam && (
                  <Badge variant="neutral" size="sm">
                    Categoría: {
                      categoryIdParam === 'SYSTEM_TRANSFER'
                        ? 'Transferencia entre cuentas'
                        : (categories?.flatMap(c => [c, ...(c.subcategories || [])]).find(c => c.id === categoryIdParam)?.name || 'Seleccionada')
                    }
                  </Badge>
                )}
                {hasActiveDate && (
                  <Badge variant="neutral" size="sm">
                    Fecha:{' '}
                    {datePresetParam && datePresetParam !== 'all' && datePresetParam !== 'custom'
                      ? DATE_PRESET_LABELS[datePresetParam] || datePresetParam
                      : startDateParam && endDateParam
                      ? `${formatDateEC(startDateParam)} - ${formatDateEC(endDateParam)}`
                      : startDateParam
                      ? `Desde ${formatDateEC(startDateParam)}`
                      : endDateParam
                      ? `Hasta ${formatDateEC(endDateParam)}`
                      : 'Personalizada'}
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

