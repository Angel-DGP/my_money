import { useGoalsQuery, type GoalDto } from '@entities/goal';
import { GoalProgress } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';

export function ActiveGoalsWidget() {
  const { data: response = [], isLoading, isError, refetch } = useGoalsQuery();

  // Filtrar solo las que no estén completadas
  const activeGoals = response.filter((g: GoalDto) => g.status !== 'completed').slice(0, 3); // Top 3

  return (
    <div className="bg-background rounded-xl border border-border-subtle p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Metas Activas</h3>
      
      <QueryState
        data={activeGoals}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin metas"
        emptyDescription="No tienes metas de ahorro activas."
        onRetry={refetch}
      >
        {(data) => (
          <div className="space-y-4">
            {data.map((goal: GoalDto) => (
              <div key={goal.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{goal.name}</span>
                </div>
                <GoalProgress 
                  current={Number(goal.current_amount.value)}
                  target={Number(goal.target_amount.value)}
                  remaining={Number(goal.target_amount.value) - Number(goal.current_amount.value)}
                  percentage={goal.progress_percentage}
                  currency={goal.target_amount.currency}
                />

              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
