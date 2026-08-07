import { Card, ProgressBar, Badge } from '@mymoney/ui';
import type { FinancialHealthScore } from '../../../entities/insights/api/insights.api';

export interface FinancialHealthWidgetProps {
  data: FinancialHealthScore;
  className?: string;
}

export function FinancialHealthWidget({ data, className }: FinancialHealthWidgetProps) {
  if (!data || !data.metrics) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'success';
      case 'GOOD': return 'primary';
      case 'FAIR': return 'warning';
      case 'POOR': return 'error';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'Excelente';
      case 'GOOD': return 'Bueno';
      case 'FAIR': return 'Regular';
      case 'POOR': return 'Pobre';
      default: return 'Desconocido';
    }
  };

  const color = getStatusColor(data.status);

  return (
    <Card className={`p-6 flex flex-col gap-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Salud Financiera</h3>
          <p className="text-sm text-text-secondary mt-1">Tu puntuación global basada en hábitos</p>
        </div>
        <Badge variant={color as React.ComponentProps<typeof Badge>['variant']}>{getStatusLabel(data.status)}</Badge>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight text-text-primary">{data.score}</span>
        <span className="text-lg text-text-muted mb-1">/ 100</span>
      </div>

      <div className="space-y-4 mt-2">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-text-secondary">Apego al Presupuesto</span>
            <span className="font-medium text-text-primary">{data.metrics.budget_adherence} / 40</span>
          </div>
          <ProgressBar progress={(data.metrics.budget_adherence / 40) * 100} variant="primary" size="sm" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-text-secondary">Tasa de Ahorro</span>
            <span className="font-medium text-text-primary">{data.metrics.savings_rate} / 35</span>
          </div>
          <ProgressBar progress={(data.metrics.savings_rate / 35) * 100} variant="success" size="sm" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-text-secondary">Progreso de Metas</span>
            <span className="font-medium text-text-primary">{data.metrics.goals_progress} / 25</span>
          </div>
          <ProgressBar progress={(data.metrics.goals_progress / 25) * 100} variant="brand" size="sm" />
        </div>
      </div>
    </Card>
  );
}
