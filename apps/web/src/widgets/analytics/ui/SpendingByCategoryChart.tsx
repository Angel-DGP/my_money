import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, Icon } from '@mymoney/ui';
import type { SpendingByCategoryDto } from '../../../entities/analytics/api/analytics.api';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

export interface SpendingByCategoryChartProps {
  data: SpendingByCategoryDto[];
  className?: string;
}

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

export function SpendingByCategoryChart({ data, className }: SpendingByCategoryChartProps) {
  // Take top 6 categories, group the rest as "Otros"
  let chartData = data;
  if (data.length > 6) {
    const top = data.slice(0, 5);
    const others = data.slice(5);
    const othersAmount = others.reduce((acc, curr) => acc + curr.amount, 0);
    chartData = [
      ...top,
      {
        category_id: 'others',
        category_name: 'Otros',
        category_icon: 'more-horizontal',
        amount: othersAmount,
        currency: data[0]?.currency || 'USD',
        percentage: others.reduce((acc, curr) => acc + curr.percentage, 0),
      }
    ];
  }

  return (
    <Card className={`p-6 flex flex-col ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon name="pie-chart" size="sm" className="text-brand-500" />
          Gastos por Categoría
        </h3>
        <p className="text-sm text-text-secondary mt-1">Distribución del gasto en el mes actual</p>
      </div>
      
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted space-y-2 py-10">
          <Icon name="pie-chart" size="lg" className="opacity-50" />
          <p>No hay gastos registrados este mes.</p>
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="amount"
                nameKey="category_name"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as string} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any) => formatCurrency(Number(value), chartData[0]?.currency || 'USD')}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
