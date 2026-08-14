import { 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Card, Icon } from '@mymoney/ui';
import type { CashFlowDto } from '../../../entities/analytics/api/analytics.api';

export interface CashFlowHistoryChartProps {
  data: CashFlowDto[];
  periodMonths?: number;
  className?: string;
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
};

export function CashFlowHistoryChart({
  data = [],
  periodMonths = 6,
  className = '',
}: CashFlowHistoryChartProps) {
  const chartData = data.map((item) => ({
    name: item.label || item.month,
    Ingresos: item.income,
    Gastos: item.expense,
    'Balance Neto': item.net,
    currency: item.currency || 'USD',
  }));

  const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0);
  const netTotal = totalIncome - totalExpense;

  return (
    <Card className={`p-6 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Icon name="bar-chart-2" size="sm" className="text-brand-500" />
            Flujo Histórico y Balance Neto
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Evolución de ingresos, gastos y balance en los últimos {data.length || periodMonths} meses
          </p>
        </div>

        {data.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-muted">Balance Acumulado:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md ${
                netTotal >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {netTotal >= 0 ? '+' : ''}
              {formatCurrency(netTotal, data[0]?.currency || 'USD')}
            </span>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center text-text-muted space-y-3 py-10">
          <div className="p-4 rounded-2xl bg-surface-2/60 text-text-muted">
            <Icon name="bar-chart-2" size="lg" className="opacity-40" />
          </div>
          <p className="text-sm font-medium">No hay suficientes datos de flujo de caja</p>
        </div>
      ) : (
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                tickFormatter={(value) => `$${Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const inc = Number(payload.find((p) => p.dataKey === 'Ingresos')?.value || 0);
                    const exp = Number(payload.find((p) => p.dataKey === 'Gastos')?.value || 0);
                    const net = inc - exp;
                    const cur = (payload[0]?.payload as { currency?: string })?.currency || 'USD';

                    return (
                      <div className="bg-surface/95 backdrop-blur-md border border-border-subtle rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[170px]">
                        <div className="font-semibold text-text-primary border-b border-border-subtle pb-1">
                          {label}
                        </div>
                        <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Ingresos:
                          </span>
                          <span className="font-bold">{formatCurrency(inc, cur)}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Gastos:
                          </span>
                          <span className="font-bold">{formatCurrency(exp, cur)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border-subtle pt-1 font-semibold text-text-primary">
                          <span>Balance:</span>
                          <span className={net >= 0 ? 'text-brand-500 font-bold' : 'text-rose-500 font-bold'}>
                            {net >= 0 ? '+' : ''}
                            {formatCurrency(net, cur)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                iconType="circle"
              />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Gastos" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={32} />
              <Line
                type="monotone"
                dataKey="Balance Neto"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 1.5, stroke: 'var(--color-surface)' }}
                activeDot={{ r: 5.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
