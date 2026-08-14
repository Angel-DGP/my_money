import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { PageContainer, Card, Icon, Button, toast } from "@mymoney/ui";
import { useProjections, useUnpayCashflowEvent, PayCashflowDrawer } from "../../features/cashflow";
import type { CashflowEvent } from "../../shared/api/services/cashflow";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const formatCurrency = (value: number, currency: string = "USD") => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export function ProjectionDetailPage() {
  const { month } = useParams<{ month: string }>(); // e.g., '2026-08'
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("accountId") || undefined;
  const navigate = useNavigate();

  // Modal de pago
  const [selectedEventToPay, setSelectedEventToPay] = useState<CashflowEvent | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

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
  const unpayEvent = useUnpayCashflowEvent();
  const projection = projections?.find((p) => p.month === month) || projections?.[0];

  const formatMonth = (monthStr: string) => {
    return dayjs(monthStr + "-01").format("MMMM YYYY");
  };

  const handleOpenPayModal = (event: CashflowEvent) => {
    setSelectedEventToPay(event);
    setPayModalOpen(true);
  };

  const handleUnpay = async (event: CashflowEvent) => {
    try {
      await unpayEvent.mutateAsync(event.id);
      toast({
        title: "Cuota marcada como Pendiente",
        description: "El movimiento ha regresado al estado pendiente.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error al desmarcar",
        description: "No se pudo actualizar el estado.",
        variant: "error",
      });
    }
  };

  const paidExpenses = projection?.events
    .filter((e) => e.type === "EXPENSE" && e.status === "PAID")
    .reduce((acc, e) => acc + parseFloat(e.amount), 0) || 0;

  const totalExpenses = projection ? parseFloat(projection.total_expense) : 0;
  const pendingExpenses = totalExpenses - paidExpenses;

  return (
    <PageContainer>
      <PageContainer.Header
        title={`Detalle de Proyección: ${month ? formatMonth(month) : ""}`}
        description="Gestiona y concilia los pagos de cuotas y suscripciones proyectadas para este mes."
        backTo={() => navigate("/planning?tab=projections")}
      />

      <PageContainer.Body variant="transparent" className="py-4 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface-2/40 animate-pulse border border-border-subtle" />
            ))}
          </div>
        ) : !projection ? (
          <div className="py-12 text-center text-text-secondary bg-surface rounded-2xl border border-border-subtle">
            No se encontraron datos para este mes.
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards Super Cohesivas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Ingresos */}
              <Card className="p-5 rounded-2xl border border-border-subtle bg-surface hover:border-border transition-all flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Ingresos Proyectados
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                    <Icon name="trending-up" size="sm" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-emerald-500">
                    +{formatCurrency(parseFloat(projection.total_income))}
                  </div>
                  <p className="text-xs text-text-muted mt-1">Sueldos y otros ingresos programados</p>
                </div>
              </Card>

              {/* Card 2: Gastos / Cuotas con split Naranja/Rojo */}
              <Card className="p-5 rounded-2xl border border-border-subtle bg-surface hover:border-border transition-all flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Gastos / Cuotas Totales
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                    <Icon name="trending-down" size="sm" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-rose-500">
                    -{formatCurrency(totalExpenses)}
                  </div>
                  {paidExpenses > 0 ? (
                    <div className="flex items-center gap-3 text-xs mt-2 pt-2 border-t border-border-subtle">
                      <span className="font-semibold text-amber-500 flex items-center gap-1">
                        <Icon name="check" size="xs" /> Pagado: {formatCurrency(paidExpenses)}
                      </span>
                      <span className="text-text-muted">|</span>
                      <span className="font-medium text-rose-500">
                        Por pagar: {formatCurrency(pendingExpenses)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">Cuotas diferidas y suscripciones del mes</p>
                  )}
                </div>
              </Card>

              {/* Card 3: Balance Proyectado */}
              <Card className="p-5 rounded-2xl border border-border-subtle bg-surface hover:border-border transition-all flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Balance Final Proyectado
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-surface-2 text-text-secondary flex items-center justify-center border border-border-subtle">
                    <Icon name="bar-chart-2" size="sm" />
                  </div>
                </div>
                <div>
                  {(() => {
                    const balance =
                      parseFloat(projection.total_income) -
                      parseFloat(projection.total_expense);
                    return (
                      <div
                        className={`text-3xl font-extrabold tracking-tight ${
                          balance < 0 ? "text-rose-500" : "text-brand-500"
                        }`}
                      >
                        {formatCurrency(balance)}
                      </div>
                    );
                  })()}
                  <p className="text-xs text-text-muted mt-1">Ingresos menos gastos proyectados</p>
                </div>
              </Card>
            </div>

            {/* Tabla de Movimientos */}
            <Card className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary">
                    <Icon name="menu" size="xs" />
                  </div>
                  <h3 className="font-bold text-base text-text-primary">
                    Movimientos Proyectados ({projection.events.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Naranja = Pagada
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-rose-500">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Rojo = Pendiente
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-2/30 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4 w-32">Fecha</th>
                      <th className="py-3 px-4 min-w-[160px]">Descripción</th>
                      <th className="py-3 px-4">Origen</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Monto</th>
                      <th className="py-3 px-4 text-right w-36 sticky right-0 z-10 bg-surface shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {projection.events.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-text-secondary text-sm"
                        >
                          No hay movimientos registrados para este mes.
                        </td>
                      </tr>
                    ) : (
                      projection.events.map((event) => {
                        const isPaid = event.status === "PAID";
                        const isIncome = event.type === "INCOME";

                        return (
                          <tr
                            key={event.id}
                            className={`hover:bg-surface-2/20 transition-colors ${
                              isPaid ? "bg-amber-500/[0.03]" : ""
                            }`}
                          >
                            <td className="py-3 px-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                              {dayjs(event.date).format("DD MMM YYYY")}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-sm font-semibold block ${
                                  isPaid ? "text-amber-500" : "text-text-primary"
                                }`}
                              >
                                {event.description}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 text-[11px] font-semibold text-text-secondary border border-border-subtle">
                                {event.source_type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                                  <Icon name="check" size="xs" /> Pagada
                                </span>
                              ) : isIncome ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  Por recibir
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`text-sm font-bold whitespace-nowrap ${
                                  isPaid
                                    ? "text-amber-500"
                                    : isIncome
                                    ? "text-emerald-500"
                                    : "text-rose-500"
                                }`}
                              >
                                {isIncome ? "+" : "-"}
                                {formatCurrency(parseFloat(event.amount))}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right sticky right-0 z-10 bg-surface shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                              {isPaid ? (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  disabled={unpayEvent.isPending}
                                  onClick={() => handleUnpay(event)}
                                  className="text-text-muted hover:text-text-primary text-xs inline-flex items-center gap-1"
                                >
                                  <Icon name="refresh-cw" size="xs" />
                                  Desmarcar
                                </Button>
                              ) : (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleOpenPayModal(event)}
                                  className="text-amber-500 border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-500 text-xs font-semibold inline-flex items-center gap-1 shadow-xs"
                                >
                                  <Icon name="credit-card" size="xs" />
                                  Pagar
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </PageContainer.Body>

      {/* Drawer de Pago con selección de cuenta y débito */}
      <PayCashflowDrawer
        open={payModalOpen}
        onOpenChange={setPayModalOpen}
        event={selectedEventToPay}
        defaultAccountId={accountId}
      />
    </PageContainer>
  );
}
