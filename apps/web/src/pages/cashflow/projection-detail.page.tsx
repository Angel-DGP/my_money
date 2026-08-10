import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { PageContainer, Card, Icon, Amount } from "@mymoney/ui";
import { useProjections } from "../../features/cashflow";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export function ProjectionDetailPage() {
  const { month } = useParams<{ month: string }>(); // e.g., '2026-08'
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("accountId") || undefined;
  const navigate = useNavigate();

  // We query for just this month
  const startDate = month
    ? dayjs(`${month}-01`).startOf("month").toISOString()
    : "";
  const endDate = month
    ? dayjs(`${month}-01`).endOf("month").toISOString()
    : "";

  const { data: projections, isLoading } = useProjections(
    startDate,
    endDate,
    accountId,
  );
  const projection = projections?.[0]; // There should only be one month in the result

  const formatMonth = (monthStr: string) => {
    return dayjs(monthStr + "-01").format("MMMM YYYY");
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title={`Detalle de Proyección: ${month ? formatMonth(month) : ""}`}
        description="Vista detallada de los movimientos esperados para este mes."
        backTo={() => navigate("/projections")}
      />

      <PageContainer.Body variant="transparent" className="py-6 space-y-6">
        {isLoading ? (
          <div className="text-text-secondary text-sm">
            Cargando detalles...
          </div>
        ) : !projection ? (
          <div className="py-12 text-center text-text-secondary bg-background-paper rounded-2xl border border-border-subtle">
            No se encontraron datos para este mes.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col">
                <div className="p-4 border-b border-border-subtle bg-surface-2/30">
                  <span className="text-text-secondary text-sm font-medium">
                    Ingresos Estimados
                  </span>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <Amount
                    value={parseFloat(projection.total_income)}
                    currency="USD"
                    className="text-2xl font-bold text-success-600"
                  />
                  <Icon
                    name="trending-up"
                    className="text-success-500 opacity-50"
                    size="lg"
                  />
                </div>
              </Card>

              <Card className="flex flex-col">
                <div className="p-4 border-b border-border-subtle bg-surface-2/30">
                  <span className="text-text-secondary text-sm font-medium">
                    Gastos / Cuotas Estimadas
                  </span>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <Amount
                    value={parseFloat(projection.total_expense)}
                    currency="USD"
                    className="text-2xl font-bold text-error-600"
                  />
                  <Icon
                    name="trending-down"
                    className="text-error-500 opacity-50"
                    size="lg"
                  />
                </div>
              </Card>

              <Card className="flex flex-col">
                <div className="p-4 border-b border-border-subtle bg-surface-2/30">
                  <span className="text-text-secondary text-sm font-medium">
                    Balance Final
                  </span>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <Amount
                    value={
                      parseFloat(projection.total_income) -
                      parseFloat(projection.total_expense)
                    }
                    currency="USD"
                    className={`text-2xl font-bold ${parseFloat(projection.total_income) - parseFloat(projection.total_expense) < 0 ? "text-error-600" : "text-brand-600"}`}
                  />
                  <Icon
                    name="bar-chart-2"
                    className="text-brand-500 opacity-50"
                    size="lg"
                  />
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-5 border-b border-border-subtle bg-surface-2/30 flex items-center gap-2">
                <Icon name="menu" size="sm" className="text-text-secondary" />
                <h3 className="font-semibold text-text-primary">
                  Todos los Movimientos ({projection.events.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface/50 text-xs text-text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4 font-medium w-32">Fecha</th>
                      <th className="py-3 px-4 font-medium">Descripción</th>
                      <th className="py-3 px-4 font-medium">Origen</th>
                      <th className="py-3 px-4 font-medium text-right">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projection.events.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-text-secondary text-sm"
                        >
                          No hay movimientos registrados
                        </td>
                      </tr>
                    ) : (
                      projection.events.map((event) => (
                        <tr
                          key={event.id}
                          className="border-b border-border-subtle hover:bg-surface/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-text-secondary whitespace-nowrap">
                            {dayjs(event.date).format("DD MMM YYYY")}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-text-primary">
                              {event.description}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-2 text-xs font-medium text-text-secondary">
                              {event.source_type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Amount
                              value={parseFloat(event.amount)}
                              currency="USD"
                              className={`text-sm font-medium whitespace-nowrap ${event.type === "INCOME" ? "text-success-600" : "text-text-primary"}`}
                              signDisplay={
                                event.type === "INCOME" ? "always" : "auto"
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </PageContainer.Body>
    </PageContainer>
  );
}
