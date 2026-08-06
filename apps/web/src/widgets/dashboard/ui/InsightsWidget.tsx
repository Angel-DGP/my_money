import { Card, AlertBanner } from '@mymoney/ui';
import type { Insight } from '../../../entities/insights/api/insights.api';

export interface InsightsWidgetProps {
  insights: Insight[];
  className?: string;
}

export function InsightsWidget({ insights, className }: InsightsWidgetProps) {

  return (
    <Card className={`p-6 flex flex-col h-full ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Insights</h3>
        <p className="text-sm text-text-secondary">Análisis inteligente de tus finanzas</p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {Array.isArray(insights) && insights.map((insight) => (
          <AlertBanner
            key={insight.id}
            variant={insight.type.toLowerCase() as any}
            title={insight.title}
            description={insight.description}
          />
        ))}
        {(!Array.isArray(insights) || insights.length === 0) && (
          <div className="flex flex-col items-center justify-center flex-1 text-text-muted py-8 text-center">
            <span className="text-sm">No hay nuevos insights por ahora.</span>
          </div>
        )}
      </div>
    </Card>
  );
}
