import { PageContainer } from '@mymoney/ui';
import { useAnalytics } from '../../../entities/analytics/api/analytics.api';
import { SpendingByCategoryChart } from '../../../widgets/analytics/ui/SpendingByCategoryChart';
import { CashFlowHistoryChart } from '../../../widgets/analytics/ui/CashFlowHistoryChart';

export function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <PageContainer>
        <PageContainer.Header title="Analíticas" description="Cargando tus datos financieros..." />
        <PageContainer.Body variant="transparent" className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] bg-surface rounded-xl animate-pulse" />
            <div className="h-[400px] bg-surface rounded-xl animate-pulse" />
          </div>
        </PageContainer.Body>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <PageContainer.Header title="Analíticas" description="Tus insights financieros" />
        <PageContainer.Body variant="transparent" className="py-6">
          <div className="p-8 text-center bg-surface rounded-xl border border-border-subtle">
            <p className="text-error-500">Hubo un error cargando las analíticas. Por favor, intenta de nuevo.</p>
          </div>
        </PageContainer.Body>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContainer.Header
        title="Analíticas y Reportes"
        description="Analiza tus hábitos de gasto y flujo de dinero a largo plazo."
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingByCategoryChart data={data.spending_by_category} className="min-h-[400px]" />
            <CashFlowHistoryChart data={data.cash_flow} className="min-h-[400px]" />
          </div>
          {/* Espacio para futuros gráficos, ej: Patrimonio Neto */}
        </div>
      </PageContainer.Body>
    </PageContainer>
  );
}
