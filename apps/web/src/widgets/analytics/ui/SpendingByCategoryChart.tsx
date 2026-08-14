import { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Card, Icon, type IconName } from '@mymoney/ui';
import type { SpendingByCategoryDto } from '../../../entities/analytics/api/analytics.api';

const DEFAULT_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

export interface SpendingByCategoryChartProps {
  data: SpendingByCategoryDto[];
  totalExpense?: number;
  periodLabel?: string;
  className?: string;
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
};

export function SpendingByCategoryChart({
  data = [],
  totalExpense,
  periodLabel = 'este periodo',
  className = '',
}: SpendingByCategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = totalExpense ?? data.reduce((acc, curr) => acc + curr.amount, 0);

  // Limit pie chart slices to top 5 + "Otros"
  let chartData = data;
  if (data.length > 6) {
    const top = data.slice(0, 5);
    const others = data.slice(5);
    const othersAmount = others.reduce((acc, curr) => acc + curr.amount, 0);
    const othersCount = others.reduce((acc, curr) => acc + curr.transaction_count, 0);
    chartData = [
      ...top,
      {
        category_id: 'others',
        category_name: 'Otros',
        category_icon: 'more-horizontal',
        category_color: '#94a3b8',
        amount: othersAmount,
        transaction_count: othersCount,
        currency: data[0]?.currency || 'USD',
        percentage: total > 0 ? Number(((othersAmount / total) * 100).toFixed(1)) : 0,
      },
    ];
  }

  return (
    <Card className={`p-6 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Icon name="pie-chart" size="sm" className="text-brand-500" />
            Distribución por Categoría
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Gastos acumulados en {periodLabel}
          </p>
        </div>
        {total > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60">
            {data.length} {data.length === 1 ? 'categoría' : 'categorías'}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center text-text-muted space-y-3 py-10">
          <div className="p-4 rounded-2xl bg-surface-2/60 text-text-muted">
            <Icon name="pie-chart" size="lg" className="opacity-40" />
          </div>
          <p className="text-sm font-medium">No hay gastos registrados en {periodLabel}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
          {/* Donut Chart with Centered Total */}
          <div className="md:col-span-6 relative h-[240px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category_name"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => {
                    const fillColor = entry.category_color || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
                    const isHovered = activeIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor as string}
                        opacity={activeIndex === null || isHovered ? 1 : 0.45}
                        stroke="var(--color-surface)"
                        strokeWidth={2}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]?.payload as SpendingByCategoryDto;
                      return (
                        <div className="bg-surface/95 backdrop-blur-md border border-border-subtle rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <div className="flex items-center gap-2 font-semibold text-text-primary">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.category_color || '#3b82f6' }}
                            />
                            {item.category_name}
                          </div>
                          <div className="text-text-secondary flex justify-between gap-4">
                            <span>Monto:</span>
                            <span className="font-bold text-text-primary">
                              {formatCurrency(item.amount, item.currency)}
                            </span>
                          </div>
                          <div className="text-text-secondary flex justify-between gap-4">
                            <span>Proporción:</span>
                            <span className="font-semibold text-brand-500">{item.percentage}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total Centered Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Total</span>
              <span className="text-lg font-bold text-text-primary">
                {formatCurrency(total, data[0]?.currency || 'USD')}
              </span>
            </div>
          </div>

          {/* Mini Categories Legend List */}
          <div className="md:col-span-6 flex flex-col gap-2.5">
            {chartData.map((item, index) => {
              const fillColor = item.category_color || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
              const isHovered = activeIndex === index;
              return (
                <div
                  key={item.category_id}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
                    isHovered ? 'bg-surface-2 shadow-xs' : 'hover:bg-surface-2/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: fillColor as string }}
                    />
                    <div className="flex items-center gap-1.5 truncate">
                      {item.category_icon && (
                        <Icon name={item.category_icon as IconName} size="xs" className="text-text-muted shrink-0" />
                      )}
                      <span className="text-xs font-medium text-text-primary truncate">
                        {item.category_name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="text-xs font-semibold text-text-primary block">
                      {formatCurrency(item.amount, item.currency)}
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
