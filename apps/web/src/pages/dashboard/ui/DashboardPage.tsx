import { AccountsSummaryWidget, RecentTransactionsWidget, ActiveBudgetsWidget, ActiveGoalsWidget, QuickActionsWidget, UpcomingSubscriptionsWidget } from '@widgets/dashboard';
import { MonthlyFlowChart } from '../../../widgets/dashboard/ui/MonthlyFlowChart';
import { FinancialHealthWidget } from '../../../widgets/dashboard/ui/FinancialHealthWidget';
import { InsightsWidget } from '../../../widgets/dashboard/ui/InsightsWidget';
import { useDashboardSummary, useMonthlyFlow } from '../../../entities/dashboard/api/dashboard.api';
import { useInsights, useHealthScore } from '../../../entities/insights/api/insights.api';
import { DashboardSkeleton } from './DashboardSkeleton';
import { StatCard, PageContainer } from '@mymoney/ui';

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

export function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: monthlyFlow, isLoading: loadingFlow } = useMonthlyFlow();
  const { data: insights, isLoading: loadingInsights } = useInsights();
  const { data: healthScore, isLoading: loadingHealth } = useHealthScore();

  const isLoading = loadingSummary || loadingFlow || loadingInsights || loadingHealth;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Helper variables for stat cards
  const availableBalance = summary?.available_balance?.[0]?.amount || 0;
  const currency = summary?.available_balance?.[0]?.currency || 'USD';
  
  const currentMonthIncome = monthlyFlow?.current_month?.[0]?.income || 0;
  const currentMonthExpense = monthlyFlow?.current_month?.[0]?.expense || 0;

  return (
    <PageContainer className="max-w-[1400px]">
      <PageContainer.Header
        title="Hola de nuevo 👋"
        description="Este es el resumen inteligente de tus finanzas"
      />
      <PageContainer.Body variant="transparent">
      <div className="flex flex-col gap-6">
        {/* Row 1: Quick Actions */}
        <QuickActionsWidget />

        {/* Row 2: Stats (2/3) + Financial Health (1/3) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Saldo Disponible"
              value={formatCurrency(availableBalance, currency)}
              trend={{ value: 2.5, isPositive: true } as React.ComponentProps<typeof StatCard>['trend']}
              icon="wallet"
            />
            <StatCard
              title="Flujo Mensual"
              value={formatCurrency(currentMonthIncome - currentMonthExpense, currency)}
              trend={{ value: currentMonthIncome > currentMonthExpense ? 5.0 : -2.0, direction: currentMonthIncome > currentMonthExpense ? 'up' : 'down' } as React.ComponentProps<typeof StatCard>['trend']}
              icon={currentMonthIncome > currentMonthExpense ? 'arrow-up-right' : 'arrow-down-left'}
            />
          </div>
          <div className="xl:col-span-4">
            {healthScore && <FinancialHealthWidget data={healthScore} />}
          </div>
        </div>

        {/* Row 3: Monthly Flow Chart (2/3) + Insights (1/3) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            {monthlyFlow && <MonthlyFlowChart data={monthlyFlow} />}
          </div>
          <div className="xl:col-span-4 flex flex-col">
            {insights && <InsightsWidget insights={insights} className="flex-1 min-h-[300px]" />}
          </div>
        </div>

        {/* Row 4: Summary Cards (1/3 each) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AccountsSummaryWidget />
          <UpcomingSubscriptionsWidget />
          <ActiveBudgetsWidget />
        </div>

        {/* Row 5: Lists (2/3 Transactions + 1/3 Goals) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <RecentTransactionsWidget />
          </div>
          <div className="xl:col-span-4">
            <ActiveGoalsWidget />
          </div>
        </div>
      </div>
      </PageContainer.Body>
    </PageContainer>
  );
}
