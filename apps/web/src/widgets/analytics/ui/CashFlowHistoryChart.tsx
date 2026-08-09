import { 
  BarChart, 
  Bar, 
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
  className?: string;
}

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

export function CashFlowHistoryChart({ data, className }: CashFlowHistoryChartProps) {
  
  // Format the month from "YYYY-MM" to a more readable format like "Ene", "Feb"
  const chartData = data.map(item => {
    const parts = (item.month || '').split('-');
    const year = parts[0] || '2000';
    const month = parts[1] || '1';
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('es-ES', { month: 'short' });
    return {
      name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      Ingresos: item.income,
      Gastos: item.expense,
      currency: item.currency,
    };
  });

  return (
    <Card className={`p-6 flex flex-col ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon name="bar-chart-2" size="sm" className="text-brand-500" />
          Flujo Histórico (6 Meses)
        </h3>
        <p className="text-sm text-text-secondary mt-1">Evolución de ingresos y gastos recientes</p>
      </div>
      
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted space-y-2 py-10">
          <Icon name="bar-chart-2" size="lg" className="opacity-50" />
          <p>No hay datos suficientes.</p>
        </div>
      ) : (
        <div className="h-[300px] w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
              barSize={20}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'var(--color-surface-2)', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: unknown, _name: unknown, props: unknown) => {
                  const p = props as { payload?: { currency?: string } };
                  return formatCurrency(Number(value || 0), p?.payload?.currency || 'USD');
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }} 
                iconType="circle"
              />
              <Bar dataKey="Ingresos" fill="var(--color-success-500)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="var(--color-error-500)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
