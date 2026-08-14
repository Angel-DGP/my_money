import { useState, useMemo } from 'react';
import { PageContainer, Card, CardHeader, CardBody, Badge, Icon, Amount, Button, Select, AlertDialog } from '@mymoney/ui';
import { useProjections, SalaryDrawer } from '../../features/cashflow';
import { useSalaries, useDeleteSalary } from '../../features/cashflow/api/useSalaries';
import { useAccountsQuery } from '@entities/account';
import { useNavigate } from 'react-router-dom';
import { toast } from '@mymoney/ui';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

type Tab = 'projections' | 'salaries';

export function ProjectionsPage() {
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccountsQuery();
  const [activeTab, setActiveTab] = useState<Tab>('projections');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [salaryDrawerOpen, setSalaryDrawerOpen] = useState(false);

  // Projections data
  const dateRange = useMemo(() => {
    const start = dayjs().year(selectedYear).startOf('year');
    const end = start.endOf('year');
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [selectedYear]);

  const { data: projections, isLoading: isLoadingProjections } = useProjections(
    dateRange.startDate,
    dateRange.endDate,
    selectedAccountId || undefined,
  );

  // Salaries data
  const { data: salaries = [], isLoading: isLoadingSalaries } = useSalaries();
  const deleteSalary = useDeleteSalary();

  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - 1 + i);

  const formatMonth = (monthStr: string) =>
    dayjs(monthStr + '-01').format('MMMM YYYY');

  const groupedSalaries = useMemo(() => {
    const map = new Map<string, { id: string; description: string; amount: string; count: number; firstDate: string; ids: string[] }>();
    salaries.forEach((s) => {
      const key = `${s.description}-${s.amount}`;
      if (!map.has(key)) {
        map.set(key, {
          id: s.id,
          description: s.description || 'Sueldo',
          amount: s.amount,
          count: 1,
          firstDate: s.date,
          ids: [s.id],
        });
      } else {
        const group = map.get(key)!;
        group.count += 1;
        group.ids.push(s.id);
        if (dayjs(s.date).isBefore(dayjs(group.firstDate))) {
          group.firstDate = s.date;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => dayjs(a.firstDate).diff(dayjs(b.firstDate)));
  }, [salaries]);

  const handleDeleteGroup = (ids: string[]) => {
    deleteSalary.mutate(ids, {
      onSuccess: () => {
        toast({ title: 'Sueldo eliminado', variant: 'success' });
        setDeleteTarget(null);
      },
      onError: () => {
        toast({ title: 'Error al eliminar', variant: 'error' });
        setDeleteTarget(null);
      },
    });
  };

  const groupToDelete = groupedSalaries.find((g) => g.ids.includes(deleteTarget || ''));

  return (
    <PageContainer>
      <PageContainer.Header
        title="Proyecciones y Flujo de Caja"
        description="Visualiza tus ingresos y pagos futuros para los próximos 12 meses."
        actions={
          <Button onClick={() => setSalaryDrawerOpen(true)} variant="primary">
            <Icon name="plus" size="sm" className="mr-2" />
            Registrar Sueldo
          </Button>
        }
      />

      <PageContainer.Body variant="transparent" className="space-y-6 pt-4">
        {/* ── TABS ── */}
        <div className="flex gap-1 p-1 bg-surface-2/60 rounded-xl w-fit border border-border-subtle">
          {([
            { key: 'projections', label: 'Proyecciones', icon: 'trending-up' },
            { key: 'salaries', label: 'Mis Sueldos', icon: 'briefcase' },
          ] as { key: Tab; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name={tab.icon} size="xs" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: PROYECCIONES ── */}
        {activeTab === 'projections' && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 w-full sm:w-auto">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedYear === y
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-surface hover:bg-surface-2 text-text-secondary hover:text-text-primary border border-border-subtle'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64 shrink-0">
                <Select
                  id="accountFilter"
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                  placeholder="Todas las cuentas"
                >
                  <option value="">Todas las cuentas</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Cards grid */}
            {isLoadingProjections ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-2xl bg-surface-2/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projections?.map((proj) => {
                  const income = parseFloat(proj.total_income);
                  const expense = parseFloat(proj.total_expense);
                  const balance = income - expense;
                  const isAlert = balance < 0;

                  const paidExpense = proj.events
                    ?.filter((e) => e.type === 'EXPENSE' && e.status === 'PAID')
                    .reduce((acc, e) => acc + parseFloat(e.amount), 0) || 0;
                  const pendingExpense = expense - paidExpense;

                  return (
                    <Card
                      key={proj.month}
                      className={`flex flex-col rounded-2xl border border-border-subtle bg-surface hover:border-border transition-all shadow-xs ${
                        isAlert ? 'border-rose-500/40 bg-rose-500/[0.02]' : ''
                      }`}
                    >
                      <CardHeader className="pb-2 border-b border-border-subtle flex flex-row items-center justify-between">
                        <h3 className="font-bold text-lg text-text-primary capitalize">
                          {formatMonth(proj.month)}
                        </h3>
                        {isAlert && (
                          <Badge variant="error" size="sm">
                            <Icon name="alert-triangle" size="xs" className="mr-1" /> Déficit
                          </Badge>
                        )}
                      </CardHeader>
                      <CardBody className="pt-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary flex items-center gap-2">
                            <Icon name="trending-up" size="xs" className="text-emerald-500" /> Ingresos:
                          </span>
                          <Amount value={income} currency="USD" className="font-semibold text-emerald-500" />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary flex items-center gap-2">
                            <Icon name="trending-down" size="xs" className="text-rose-500" /> Gastos / Cuotas:
                          </span>
                          <Amount value={expense} currency="USD" className="font-semibold text-rose-500" />
                        </div>

                        {paidExpense > 0 && (
                          <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                            <span className="flex items-center gap-1 font-semibold">
                              <Icon name="check" size="xs" /> Pagado: <Amount value={paidExpense} currency="USD" className="font-bold text-amber-500" />
                            </span>
                            <span className="font-medium text-rose-500">
                              Pendiente: <Amount value={pendingExpense} currency="USD" className="font-bold text-rose-500" />
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-sm font-semibold border-t border-border-subtle pt-3 mt-1">
                          <span className="text-text-primary">Disponible:</span>
                          <Amount value={balance} currency="USD" className={isAlert ? 'text-rose-500 font-bold' : 'text-text-primary font-bold'} />
                        </div>

                        <div className="mt-4 pt-3 border-t border-border-subtle">
                          <Button
                            variant="secondary"
                            className="w-full rounded-xl"
                            onClick={() =>
                              navigate(
                                `/projections/${proj.month}${selectedAccountId ? `?accountId=${selectedAccountId}` : ''}`,
                              )
                            }
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}

                {projections?.length === 0 && (
                  <div className="col-span-full py-16 text-center text-text-secondary bg-background-paper rounded-2xl border border-border-subtle">
                    <Icon name="calendar" size="lg" className="mx-auto mb-4 text-text-muted" />
                    <p className="font-medium text-text-primary mb-1">Sin proyecciones</p>
                    <p className="text-sm">Registra un sueldo para comenzar a ver tus proyecciones.</p>
                  </div>
                )}

              </div>
            )}
          </>
        )}

        {/* ── TAB: MIS SUELDOS ── */}
        {activeTab === 'salaries' && (
          <Card>
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="briefcase" size="sm" className="text-primary-500" />
                <h3 className="font-semibold text-text-primary">
                  Sueldos Registrados
                </h3>
              </div>
            </div>

            {isLoadingSalaries ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-surface-2/40 animate-pulse" />
                ))}
              </div>
            ) : groupedSalaries.length === 0 ? (
              <div className="py-12 text-center text-text-secondary">
                <Icon name="briefcase" size="lg" className="mx-auto mb-4 text-text-muted" />
                <p className="font-medium text-text-primary mb-1">Sin sueldos registrados</p>
                <p className="text-sm mb-4">Registra tu sueldo para proyectar tus ingresos futuros.</p>
              </div>

            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface/50 text-xs text-text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4 font-medium w-36">Inicio</th>
                      <th className="py-3 px-4 font-medium">Descripción</th>
                      <th className="py-3 px-4 font-medium">Duración</th>
                      <th className="py-3 px-4 font-medium text-right">Monto</th>
                      <th className="py-3 px-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedSalaries.map((group) => (
                      <tr
                        key={group.id}
                        className="border-b border-border-subtle hover:bg-surface/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-text-secondary whitespace-nowrap">
                          {dayjs(group.firstDate).format('DD MMM YYYY')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-text-primary">
                            {group.description}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="neutral" size="sm">
                            {group.count} {group.count === 1 ? 'mes' : 'meses'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Amount
                            value={parseFloat(group.amount)}
                            currency="USD"
                            className="text-sm font-semibold text-success-600"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              aria-label="Eliminar sueldo"
                              onClick={() => setDeleteTarget(group.ids[0] || null)} // Just use first ID as target to open dialog
                              className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors"
                            >
                              <Icon name="trash" size="sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </PageContainer.Body>

      {/* ── CONFIRM DELETE DIALOG ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar este registro de sueldo?"
        description={
          groupToDelete
            ? `Se eliminará el sueldo de ${groupToDelete.amount} y se removerán las proyecciones de los ${groupToDelete.count} meses siguientes. Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar Todo"
        cancelText="Cancelar"
        type="error"
        onConfirm={() => groupToDelete && handleDeleteGroup(groupToDelete.ids)}
        isLoading={deleteSalary.isPending}
      />

      {/* ── SALARY DRAWER (Slide-over / Bottom Sheet) ── */}
      <SalaryDrawer
        open={salaryDrawerOpen}
        onOpenChange={setSalaryDrawerOpen}
      />

    </PageContainer>
  );
}
