import { useTransactionsQuery, type Transaction } from '@entities/transaction';
import { TransactionCard } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';
import { useAccountsQuery } from '@entities/account';
import { useCategoriesQuery } from '@entities/category';

export function RecentTransactionsWidget() {
  const { data: response, isLoading, isError, refetch } = useTransactionsQuery({ limit: 5 });
  const { data: accountsResponse, isLoading: isLoadingAccounts } = useAccountsQuery();
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategoriesQuery();

  const transactions = Array.isArray(response) ? response : [];

  const accountMap = (Array.isArray(accountsResponse) ? accountsResponse : []).reduce((acc, account) => {
    acc[account.id] = account.name;
    return acc;
  }, {} as Record<string, string>);

  const categoryMap = (Array.isArray(categoriesResponse) ? categoriesResponse : []).reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="bg-background rounded-2xl border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Movimientos Recientes</h3>
      
      <QueryState
        data={transactions}
        isLoading={isLoading || isLoadingAccounts || isLoadingCategories}
        isError={isError}
        emptyTitle="Sin transacciones"
        emptyDescription="No hay transacciones recientes."
        onRetry={refetch}
      >
        {(data) => (
          <div className="space-y-4">
            {data.map((t: Transaction) => (
              <TransactionCard
                key={t.id}
                title={t.category_id ? categoryMap[t.category_id] || 'Categoría' : 'Categoría'}
                category={accountMap[t.account_id] || 'Cuenta'}
                amount={Number(t.amount.value)}
                variant={t.type === 'INCOME' ? 'income' : 'expense'}
                date={new Date(t.date)}
              />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
