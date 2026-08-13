import { PageContainer } from '@mymoney/ui';
import { SalaryForm } from '../../features/cashflow';
import { useNavigate } from 'react-router-dom';

export function NewSalaryPage() {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <PageContainer.Header
        title="Registrar Sueldo"
        description="Ingresa un sueldo recurrente para visualizarlo en tus proyecciones."
        backTo={() => navigate('/planning?tab=projections')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <SalaryForm />
      </PageContainer.Body>
    </PageContainer>
  );
}
