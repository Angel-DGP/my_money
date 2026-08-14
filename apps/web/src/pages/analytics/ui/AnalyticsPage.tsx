import { useState } from 'react';
import { PageContainer, StatCard, Button, Icon, Card } from '@mymoney/ui';
import { useAnalytics } from '../../../entities/analytics/api/analytics.api';
import { SpendingByCategoryChart } from '../../../widgets/analytics/ui/SpendingByCategoryChart';
import { CashFlowHistoryChart } from '../../../widgets/analytics/ui/CashFlowHistoryChart';
import { CategoryBreakdownTable } from '../../../widgets/analytics/ui/CategoryBreakdownTable';
import { FinancialInsightsCard } from '../../../widgets/analytics/ui/FinancialInsightsCard';
import { TransactionDrawer } from '../../../features/transactions/ui/TransactionDrawer';

const PERIOD_OPTIONS = [
  { value: 1, label: 'Este Mes' },
  { value: 3, label: '3 Meses' },
  { value: 6, label: '6 Meses' },
  { value: 12, label: '12 Meses' },
];

export function AnalyticsPage() {
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useAnalytics(selectedMonths);

  const activePeriodLabel = PERIOD_OPTIONS.find((p) => p.value === selectedMonths)?.label || 'este periodo';

  return (
    <PageContainer>
      <PageContainer.Header
        title="Analíticas y Reportes"
        description="Métricas ejecutivas, flujo de dinero, desglose de gastos y recomendaciones inteligentes."
        className="flex-col sm:flex-row items-start sm:items-center gap-3"
        actions={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-2/60 border border-border-subtle overflow-x-auto max-w-full w-full sm:w-auto justify-between sm:justify-start">
            {PERIOD_OPTIONS.map((opt) => {
              const isActive = selectedMonths === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedMonths(opt.value)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        }
      />

      <PageContainer.Body variant="transparent" className="py-6">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-6 animate-pulse">
            {/* StatCards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-surface rounded-xl border border-border-subtle" />
              ))}
            </div>
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[380px] bg-surface rounded-xl border border-border-subtle" />
              <div className="h-[380px] bg-surface rounded-xl border border-border-subtle" />
            </div>
            {/* Table Skeleton */}
            <div className="h-64 bg-surface rounded-xl border border-border-subtle" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-8">
            <div className="p-3 rounded-full bg-error-500/10 text-error-500">
              <Icon name="alert-circle" size="lg" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">Error al cargar las analíticas</h3>
              <p className="text-sm text-text-muted max-w-md">
                No pudimos procesar tus datos financieros. Por favor verifica tu conexión o intenta nuevamente.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <Icon name="refresh-cw" size="xs" className="mr-2" />
              Reintentar
            </Button>
          </Card>
        )}

        {/* Success / Loaded Data */}
        {!isLoading && !isError && data && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Top StatCards KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Income */}
              <StatCard
                title="Ingresos Totales"
                value={data.summary.total_income}
                currency={data.summary.currency}
                icon="wallet"
                trend={{
                  value: Math.abs(data.summary.income_trend_percentage),
                  label: 'vs periodo anterior',
                  isPositive: data.summary.income_trend_percentage >= 0,
                  direction: data.summary.income_trend_percentage >= 0 ? 'up' : 'down',
                }}
              />

              {/* Total Expense */}
              <StatCard
                title="Gastos Totales"
                value={data.summary.total_expense}
                currency={data.summary.currency}
                icon="pie-chart"
                trend={{
                  value: Math.abs(data.summary.expense_trend_percentage),
                  label: 'vs periodo anterior',
                  isPositive: data.summary.expense_trend_percentage <= 0,
                  direction: data.summary.expense_trend_percentage <= 0 ? 'down' : 'up',
                }}
              />

              {/* Net Savings */}
              <StatCard
                title="Ahorro Neto"
                value={data.summary.net_savings}
                currency={data.summary.currency}
                icon="piggy-bank"
                trend={{
                  value: data.summary.savings_rate,
                  label: 'de tus ingresos',
                  isPositive: data.summary.net_savings >= 0,
                  direction: data.summary.net_savings >= 0 ? 'up' : 'down',
                }}
              />

              {/* Savings Rate & Daily Avg */}
              <StatCard
                title="Tasa de Ahorro"
                value={`${data.summary.savings_rate}%`}
                icon="target"
                trend={{
                  value: Math.round(data.summary.avg_daily_expense),
                  label: 'gasto prom/día',
                  direction: 'neutral',
                }}
              />
            </div>

            {/* Empty State when 0 transactions */}
            {data.summary.transaction_count === 0 && (
              <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-2">
                <div className="p-4 rounded-2xl bg-surface-2 text-text-muted">
                  <Icon name="inbox" size="lg" className="opacity-40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text-primary">No hay movimientos en {activePeriodLabel}</h3>
                  <p className="text-sm text-text-muted max-w-md">
                    Registra ingresos o gastos para desbloquear métricas, comparativas y reportes automáticos.
                  </p>
                </div>
                <Button onClick={() => setIsTransactionDrawerOpen(true)}>
                  <Icon name="plus" size="xs" className="mr-2" />
                  Registrar Movimiento
                </Button>
              </Card>
            )}

            {/* Charts Section (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingByCategoryChart
                data={data.spending_by_category}
                totalExpense={data.summary.total_expense}
                periodLabel={activePeriodLabel}
                className="min-h-[380px]"
              />
              <CashFlowHistoryChart
                data={data.cash_flow}
                periodMonths={data.period_months}
                className="min-h-[380px]"
              />
            </div>

            {/* Detailed Category Breakdown Table */}
            <CategoryBreakdownTable
              categories={data.spending_by_category}
              totalExpense={data.summary.total_expense}
              periodLabel={activePeriodLabel}
            />

            {/* Smart Financial Insights & Top 5 Expenses */}
            <FinancialInsightsCard
              insights={data.insights}
              topExpenses={data.top_expenses}
            />
          </div>
        )}
      </PageContainer.Body>

      {/* Transaction Drawer for Empty State Quick Action */}
      <TransactionDrawer
        open={isTransactionDrawerOpen}
        onOpenChange={setIsTransactionDrawerOpen}
      />
    </PageContainer>
  );
}
