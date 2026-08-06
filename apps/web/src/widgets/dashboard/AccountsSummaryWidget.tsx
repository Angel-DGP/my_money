import { useAccountsQuery } from '@entities/account';
import { Amount } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';

export function AccountsSummaryWidget() {
  const { data: accounts = [], isLoading, isError, refetch } = useAccountsQuery();

  const balancesByCurrency = accounts.reduce((acc, account) => {
    const currency = account.current_balance.currency;
    const value = Number(account.current_balance.value);
    acc[currency] = (acc[currency] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-background rounded-xl border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Tus Cuentas</h3>
      
      <div className="mb-6 space-y-2">
        <p className="text-sm text-text-secondary">Balances Totales</p>
        {Object.keys(balancesByCurrency).length === 0 && (
          <div className="text-3xl font-bold text-text-primary">
            <Amount value={0} currency="USD" variant="neutral" />
          </div>
        )}
        {Object.entries(balancesByCurrency).map(([currency, total]) => (
          <div key={currency} className="text-3xl font-bold text-text-primary">
            <Amount value={total} currency={currency} variant="neutral" />
          </div>
        ))}
      </div>

      <QueryState
        data={accounts}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin cuentas"
        emptyDescription="No tienes cuentas configuradas."
        onRetry={refetch}
      >
        {(data) => (
          <div className="space-y-3">
            {data.map(account => (
              <div key={account.id} className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0">
                <span className="font-medium text-text-primary">{account.name}</span>
                <Amount 
                  value={Number(account.current_balance.value)} 
                  currency={account.current_balance.currency} 
                  variant="neutral" 
                />
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
