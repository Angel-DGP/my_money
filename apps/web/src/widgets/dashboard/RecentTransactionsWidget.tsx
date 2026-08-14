import { useState } from 'react';
import { useTransactionsQuery, type Transaction } from '@entities/transaction';
import { TransactionCard } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';
import { useAccountsQuery } from '@entities/account';
import { useCategoriesQuery } from '@entities/category';
import { TransactionDrawer } from '@features/transactions';

export function RecentTransactionsWidget() {
  const { data: response, isLoading, isError, refetch } = useTransactionsQuery({ limit: 5 });
  const { data: accountsResponse, isLoading: isLoadingAccounts } = useAccountsQuery();
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategoriesQuery();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

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
    <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary mb-4">Movimientos Recientes</h3>
      
      <QueryState
        data={transactions}
        isLoading={isLoading || isLoadingAccounts || isLoadingCategories}
        isError={isError}
        emptyTitle="Sin transacciones"
        emptyDescription="No hay transacciones recientes."
        onRetry={refetch}
      >
        {(data) => (
          <div className="space-y-3">
            {data.map((t: Transaction) => (
              <div
                key={t.id}
                onClick={() => setSelectedTx(t)}
                className="cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <TransactionCard
                  title={t.description || (t.category_id ? categoryMap[t.category_id] : '') || 'Transacción'}
                  category={accountMap[t.account_id] || 'Cuenta'}
                  amount={Number(t.amount.value)}
                  variant={t.type === 'INCOME' ? 'income' : 'expense'}
                  date={new Date(t.date)}
                  badges={[
                    ...(t.installment ? [{ text: `Diferido: ${t.installment.total_installments} meses`, variant: 'warning' as const }] : []),
                    ...(t.is_third_party ? [{ text: `Tercero: ${t.third_party_owner}`, variant: 'neutral' as const }] : [])
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </QueryState>

      {/* Responsive Transaction Drawer */}
      <TransactionDrawer
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
        transaction={selectedTx}
        initialViewMode={true}
      />
    </div>
  );
}
