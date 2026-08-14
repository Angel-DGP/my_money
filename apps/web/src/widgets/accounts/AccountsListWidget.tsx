import { useNavigate } from 'react-router-dom';
import { useAccountsQuery, useDeleteAccount } from '@entities/account';
import type { Account } from '@entities/account';
import { useTransactionsQuery, type Transaction } from '@entities/transaction';
import { AccountsTable, AccountDrawer } from '@features/accounts';
import { TransactionDrawer } from '@features/transactions';
import { Button, Icon, toast, PageContainer, AlertDialog, Badge, Amount } from '@mymoney/ui';
import { useState, useMemo } from 'react';
import { QueryState } from '@shared/ui/QueryState';

export function AccountsListWidget() {
  const navigate = useNavigate();
  const accountsQuery = useAccountsQuery();
  const deleteAccount = useDeleteAccount();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountDrawer, setAccountDrawer] = useState<{
    open: boolean;
    account: Account | null;
    isView: boolean;
  }>({
    open: false,
    account: null,
    isView: false,
  });
  const [txDrawerState, setTxDrawerState] = useState<{
    open: boolean;
    transaction: Transaction | null;
    isView: boolean;
  }>({
    open: false,
    transaction: null,
    isView: false,
  });
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const accounts = useMemo(() => accountsQuery.data || [], [accountsQuery.data]);
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) || null,
    [accounts, selectedAccountId]
  );

  // Transactions query for the active selected account in the right panel
  const accountTransactionsQuery = useTransactionsQuery(
    selectedAccountId ? { account_id: selectedAccountId, limit: 5 } : undefined
  );

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, a) => {
      const val = parseFloat(a.current_balance?.value || '0');
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [accounts]);

  const balanceByType = useMemo(() => {
    const map: Record<string, number> = {};
    accounts.forEach((a) => {
      const val = parseFloat(a.current_balance?.value || '0');
      map[a.type] = (map[a.type] || 0) + (isNaN(val) ? 0 : val);
    });
    return map;
  }, [accounts]);

  const handleOpenCreate = () => {
    setAccountDrawer({ open: true, account: null, isView: false });
  };

  const handleView = (account: Account) => {
    setSelectedAccountId(account.id);
  };

  const handleEdit = (account: Account) => {
    setAccountDrawer({ open: true, account, isView: false });
  };

  const handleDelete = (account: Account) => {
    setAccountToDelete(account);
  };

  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Mis Cuentas"
        description="Gestiona tus cuentas bancarias, tarjetas y efectivo con vista detallada."
        actions={
          <Button onClick={handleOpenCreate} aria-label="Nueva Cuenta" size="sm" className="px-3 sm:px-4">
            <Icon name="plus" size="sm" className="sm:mr-2" />
            <span className="hidden sm:inline">Nueva Cuenta</span>
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ─── PANEL IZQUIERDO (Lista / Tabla de Cuentas) ────────────────────── */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <QueryState
              data={accountsQuery.data}
              isLoading={accountsQuery.isLoading}
              isError={accountsQuery.isError}
              error={accountsQuery.error}
              emptyTitle="No hay cuentas"
              emptyDescription="Comienza creando tu primera cuenta."
              emptyIcon="inbox"
            >
              {(accs) => (
                <div className="bg-surface rounded-2xl border border-border-subtle p-2 shadow-sm">
                  <AccountsTable
                    accounts={accs}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </QueryState>
          </div>

          {/* ─── PANEL DERECHO (Master-Detail / Resumen de Cuenta) ─────────────── */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            {selectedAccount ? (
              <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm space-y-6">
                {/* Header de la Cuenta Seleccionada */}
                <div className="flex items-start justify-between border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                      style={{ backgroundColor: selectedAccount.color || '#3b82f6' }}
                    >
                      <Icon
                        name={(selectedAccount.icon as React.ComponentProps<typeof Icon>['name']) || 'wallet'}
                        size="md"
                        className="text-white drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-text-primary text-lg">
                          {selectedAccount.name}
                        </h3>
                        <Badge variant="neutral" size="sm">
                          {selectedAccount.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {selectedAccount.specific_type || 'Cuenta activa'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedAccountId(null)}
                    className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-2"
                    title="Cerrar detalle"
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </div>

                {/* Balance Actual */}
                <div className="p-4 rounded-xl bg-surface-2/40 border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs text-text-secondary font-medium">Balance Actual</span>
                    <div className="text-2xl font-black text-text-primary tracking-tight mt-0.5">
                      <Amount value={parseFloat(selectedAccount.current_balance?.value || '0')} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(selectedAccount)}
                    >
                      <Icon name="edit" size="xs" className="mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/transactions?accountId=${selectedAccount.id}`)}
                    >
                      <Icon name="arrow-left-right" size="xs" className="mr-1" /> Ver Todas
                    </Button>
                  </div>
                </div>

                {/* Movimientos Recientes de esta Cuenta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Movimientos Recientes
                    </h4>
                    <button
                      type="button"
                      onClick={() => setTxDrawerState({ open: true, transaction: null, isView: false })}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium hover:underline flex items-center gap-1"
                    >
                      <Icon name="plus" size="xs" /> Nuevo Movimiento
                    </button>
                  </div>

                  {accountTransactionsQuery.isLoading ? (
                    <div className="py-6 text-center text-xs text-text-muted">Cargando movimientos...</div>
                  ) : accountTransactionsQuery.data && accountTransactionsQuery.data.length > 0 ? (
                    <div className="space-y-2">
                      {accountTransactionsQuery.data.slice(0, 5).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-2 border border-border-subtle transition-colors cursor-pointer"
                          onClick={() => setTxDrawerState({ open: true, transaction: tx, isView: true })}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              tx.type === 'INCOME' ? 'bg-success-50 text-success-600 dark:bg-success-950/30' : 'bg-error-50 text-error-600 dark:bg-error-950/30'
                            }`}>
                              <Icon name={tx.type === 'INCOME' ? 'trending-up' : 'trending-down'} size="sm" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary line-clamp-1">{tx.description || 'Sin descripción'}</p>
                              <p className="text-xs text-text-muted">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className={`text-sm font-bold ${
                            tx.type === 'INCOME' ? 'text-success-600' : 'text-text-primary'
                          }`}>
                            {tx.type === 'INCOME' ? '+' : '-'}<Amount value={parseFloat(tx.amount.value)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-surface-2/20 rounded-xl border border-dashed border-border-subtle">
                      <p className="text-xs text-text-muted">No hay movimientos registrados en esta cuenta.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Vista por Defecto: Distribución Global de Cuentas */
              <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                    <Icon name="pie-chart" size="sm" className="text-primary-500" />
                    Distribución de Patrimonio
                  </h3>
                  <Badge variant="primary" size="sm">{accounts.length} Cuentas</Badge>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 via-surface to-surface border border-primary-500/20">
                  <span className="text-xs text-text-secondary font-medium">Patrimonio Total en Cuentas</span>
                  <div className="text-3xl font-black text-text-primary tracking-tight mt-1">
                    <Amount value={totalBalance} />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Por Tipo de Cuenta</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(balanceByType).map(([type, amount]) => {
                      const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
                        CHECKING: { label: 'Cuenta Corriente', icon: 'building', color: 'text-blue-500 bg-blue-500/10' },
                        SAVINGS: { label: 'Ahorros', icon: 'piggy-bank', color: 'text-emerald-500 bg-emerald-500/10' },
                        CASH: { label: 'Efectivo', icon: 'wallet', color: 'text-amber-500 bg-amber-500/10' },
                        CREDIT: { label: 'Tarjeta de Crédito', icon: 'credit-card', color: 'text-purple-500 bg-purple-500/10' },
                        INVESTMENT: { label: 'Inversión', icon: 'trending-up', color: 'text-cyan-500 bg-cyan-500/10' },
                      };
                      const conf = typeLabels[type] || { label: type, icon: 'wallet', color: 'text-primary-500 bg-primary-500/10' };
                      return (
                        <div key={type} className="p-3 rounded-xl bg-surface-2/60 border border-border-subtle flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${conf.color} shrink-0`}>
                              <Icon name={conf.icon as React.ComponentProps<typeof Icon>['name']} size="sm" />
                            </div>
                            <span className="text-xs font-semibold text-text-secondary">{conf.label}</span>
                          </div>
                          <span className="text-sm font-bold text-text-primary">
                            <Amount value={amount} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-2/30 border border-border-subtle text-xs text-text-muted flex items-start gap-2.5">
                  <span className="text-base shrink-0">💡</span>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-text-secondary">Tip:</span> Haz clic en cualquier cuenta de la tabla para ver su ficha técnica e historial de movimientos en tiempo real.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer.Body>

      {/* ─── DRAWER DE CUENTA (Creación / Edición) ─────────────────────────── */}
      <AccountDrawer
        open={accountDrawer.open}
        onOpenChange={(open) => setAccountDrawer((prev) => ({ ...prev, open }))}
        account={accountDrawer.account}
        isView={accountDrawer.isView}
      />

      {/* ─── DRAWER DE TRANSACCIÓN (Detalle / Creación) ───────────────────── */}
      <TransactionDrawer
        open={txDrawerState.open}
        onOpenChange={(open) => setTxDrawerState((prev) => ({ ...prev, open }))}
        transaction={txDrawerState.transaction}
        initialViewMode={txDrawerState.isView}
        defaultAccountId={selectedAccount?.id}
      />

      {/* ─── DIÁLOGO DE ELIMINACIÓN ────────────────────────────────────────── */}
      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
        title="Eliminar Cuenta"
        description={`¿Estás seguro de que deseas eliminar la cuenta "${accountToDelete?.name}"? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Sí, eliminar"
        isLoading={deleteAccount.isPending}
        onConfirm={() => {
          if (accountToDelete) {
            deleteAccount.mutate(accountToDelete.id, {
              onSuccess: () => {
                if (selectedAccountId === accountToDelete.id) {
                  setSelectedAccountId(null);
                }
                setAccountToDelete(null);
                toast({
                  title: 'Cuenta eliminada',
                  description: 'La cuenta ha sido eliminada.',
                  variant: 'success',
                });
              },
              onError: () => {
                toast({
                  title: 'Error al eliminar',
                  description: 'No se pudo eliminar la cuenta.',
                  variant: 'error',
                });
              },
            });
          }
        }}
      />
    </PageContainer>
  );
}

