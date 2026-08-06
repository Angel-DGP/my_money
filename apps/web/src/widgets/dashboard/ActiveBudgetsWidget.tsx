import { useBudgetsQuery } from '@entities/budget';
import { BudgetProgress } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';
import { useCategoriesQuery } from '@entities/category';

export function ActiveBudgetsWidget() {
  const { data: response, isLoading, isError, refetch } = useBudgetsQuery();
  const { data: categoriesResponse = [], isLoading: isLoadingCats } = useCategoriesQuery();

  const budgets = response || [];

  const categoryMap = categoriesResponse.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  const activeBudgets = budgets.slice(0, 3); // Top 3

  return (
    <div className="bg-background rounded-xl border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Presupuestos Activos</h3>
      
      <QueryState
        data={activeBudgets}
        isLoading={isLoading || isLoadingCats}
        isError={isError}
        emptyTitle="Sin presupuestos"
        emptyDescription="No hay presupuestos configurados."
        onRetry={refetch}
      >
        {(data) => (
          <div className="space-y-4">
            {data.map((budget: any) => (
              <div key={budget.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{categoryMap[budget.category_id] || 'Categoría'}</span>
                </div>
                <BudgetProgress 
                  spent={Number(budget.executed_amount.value)}
                  limit={Number(budget.amount.value)}
                  remaining={Number(budget.remaining_amount.value)}
                  percentage={budget.execution_percentage}
                  currency={budget.amount.currency}
                />
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
