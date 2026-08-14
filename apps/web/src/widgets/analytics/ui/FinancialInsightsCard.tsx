import { Card, Icon, type IconName } from '@mymoney/ui';
import type { FinancialInsightDto, TopExpenseDto } from '../../../entities/analytics/api/analytics.api';

export interface FinancialInsightsCardProps {
  insights: FinancialInsightDto[];
  topExpenses: TopExpenseDto[];
  className?: string;
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
};

export function FinancialInsightsCard({
  insights = [],
  topExpenses = [],
  className = '',
}: FinancialInsightsCardProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${className}`}>
      {/* Smart Insights Section */}
      <Card className="lg:col-span-6 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Icon name="zap" size="sm" className="text-amber-500" />
              Insights Financieros
            </h3>
            <span className="text-xs text-text-muted">Análisis Automático</span>
          </div>

          {insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted space-y-2">
              <Icon name="info" size="md" className="opacity-40" />
              <p className="text-xs">No hay suficientes datos para generar insights en este periodo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => {
                let borderClass = 'border-border-subtle bg-surface-2/30';
                let iconColor = 'text-brand-500';
                let iconName: IconName = 'info';

                if (insight.type === 'SUCCESS') {
                  borderClass = 'border-emerald-500/30 bg-emerald-500/5';
                  iconColor = 'text-emerald-500';
                  iconName = 'check-circle';
                } else if (insight.type === 'WARNING') {
                  borderClass = 'border-amber-500/30 bg-amber-500/5';
                  iconColor = 'text-amber-500';
                  iconName = 'alert-triangle';
                } else if (insight.type === 'INFO') {
                  borderClass = 'border-blue-500/30 bg-blue-500/5';
                  iconColor = 'text-blue-500';
                  iconName = 'info';
                }

                return (
                  <div
                    key={insight.id}
                    className={`p-3.5 rounded-xl border ${borderClass} transition-all space-y-1`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon name={iconName} size="xs" className={iconColor} />
                        <span className="text-xs font-bold text-text-primary">
                          {insight.title}
                        </span>
                      </div>
                      {insight.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border-subtle shrink-0">
                          {insight.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary pl-5 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Top 5 Expenses Section */}
      <Card className="lg:col-span-6 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Icon name="trending-down" size="sm" className="text-rose-500" />
              Gastos Más Significativos
            </h3>
            <span className="text-xs text-text-muted">Top 5</span>
          </div>

          {topExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted space-y-2">
              <Icon name="inbox" size="md" className="opacity-40" />
              <p className="text-xs">No hay gastos en este periodo.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topExpenses.map((expense, idx) => {
                const color = expense.category_color || '#f43f5e';
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2/30 hover:bg-surface-2/70 border border-border-subtle transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-text-muted w-4 text-center">
                        #{idx + 1}
                      </span>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        <Icon name={(expense.category_icon as IconName) || 'tag'} size="xs" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-text-primary block truncate">
                          {expense.description}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <span>{expense.category_name}</span>
                          <span>•</span>
                          <span>{expense.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <span className="text-xs font-bold text-rose-500">
                        -{formatCurrency(expense.amount, expense.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
