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
import { Card } from '@mymoney/ui';
import type { MonthlyFlowResponse } from '../../../entities/dashboard/api/dashboard.api';

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

export interface MonthlyFlowChartProps {
  data: MonthlyFlowResponse;
  className?: string;
}

export function MonthlyFlowChart({ data, className }: MonthlyFlowChartProps) {
  // Combinamos los datos del mes actual y el mes pasado para el gráfico
  const currentMonthData = data?.current_month?.length > 0 ? data.current_month[0] : null;
  const previousMonthData = data?.previous_month?.length > 0 ? data.previous_month[0] : null;

  // Si manejan multiples divisas, por simplicidad en este MVP mostraremos la primaria o sumamos. 
  // Asumimos USD o la primera que llegue.
  const chartData = [
    {
      name: 'Mes Anterior',
      Ingresos: previousMonthData?.income || 0,
      Gastos: previousMonthData?.expense || 0,
    },
    {
      name: 'Mes Actual',
      Ingresos: currentMonthData?.income || 0,
      Gastos: currentMonthData?.expense || 0,
    }
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Flujo Mensual</h3>
        <p className="text-sm text-text-secondary">Comparativa de ingresos vs gastos</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
            barSize={40}
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
              formatter={(value: any) => formatCurrency(Number(value), 'USD')}
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
    </Card>
  );
}
