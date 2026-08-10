import { useState, useMemo } from 'react';
import { PageContainer, Card, CardHeader, CardBody, Badge, Icon, Amount, Button, Select } from '@mymoney/ui';
import { useProjections } from '../../features/cashflow';
import { useAccountsQuery } from '@entities/account';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export function ProjectionsPage() {
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccountsQuery();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const dateRange = useMemo(() => {
    const start = dayjs().year(selectedYear).startOf('year');
    const end = start.endOf('year');
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [selectedYear]);

  const { data: projections, isLoading } = useProjections(
    dateRange.startDate, 
    dateRange.endDate, 
    selectedAccountId || undefined
  );

  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - 1 + i);

  const formatMonth = (monthStr: string) => {
    return dayjs(monthStr + '-01').format('MMMM YYYY');
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Proyecciones y Flujo de Caja"
        description="Visualiza tus ingresos y pagos futuros para los próximos 12 meses."
        actions={
          <Button onClick={() => navigate('/projections/salary/new')} variant="primary">
            <Icon name="plus" size="sm" className="mr-2" />
            Registrar Sueldo
          </Button>
        }
      />
      
      <PageContainer.Body variant="transparent" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 custom-scrollbar w-full sm:w-auto">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedYear === y 
                    ? 'bg-brand-500 text-white shadow-sm' 
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
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </Select>
          </div>
        </div>
        {isLoading ? (
          <div className="text-text-secondary text-sm">Cargando proyecciones...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projections?.map((proj) => {
              const income = parseFloat(proj.total_income);
              const expense = parseFloat(proj.total_expense);
              const balance = income - expense;
              const isAlert = balance < 0;

              return (
                <Card key={proj.month} className={`flex flex-col ${isAlert ? 'border-error-500/50 bg-error-50/10' : ''}`}>
                  <CardHeader className="pb-2 border-b border-border-subtle flex flex-row items-center justify-between">
                    <h3 className="font-semibold text-lg text-text-primary capitalize">
                      {formatMonth(proj.month)}
                    </h3>
                    {isAlert && <Badge variant="error" size="sm"><Icon name="alert-triangle" size="xs" className="mr-1"/> Déficit</Badge>}
                  </CardHeader>
                  <CardBody className="pt-4 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary flex items-center gap-2"><Icon name="trending-up" size="xs" className="text-success-500"/> Ingresos:</span>
                      <Amount value={income} currency="USD" className="font-medium text-success-600" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary flex items-center gap-2"><Icon name="trending-down" size="xs" className="text-error-500"/> Gastos / Cuotas:</span>
                      <Amount value={expense} currency="USD" className="font-medium text-error-600" />
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold border-t border-border-subtle pt-3 mt-1">
                      <span className="text-text-primary">Disponible:</span>
                      <Amount value={balance} currency="USD" className={isAlert ? 'text-error-600' : 'text-text-primary'} />
                    </div>

                    <div className="mt-6 pt-4 border-t border-border-subtle">
                      <Button 
                        variant="secondary" 
                        className="w-full" 
                        onClick={() => navigate(`/projections/${proj.month}${selectedAccountId ? `?accountId=${selectedAccountId}` : ''}`)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
            
            {projections?.length === 0 && (
              <div className="col-span-full py-12 text-center text-text-secondary bg-background-paper rounded-2xl border border-border-subtle">
                No hay proyecciones futuras registradas.
              </div>
            )}
          </div>
        )}
      </PageContainer.Body>
    </PageContainer>
  );
}
