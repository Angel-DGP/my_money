import { useNavigate } from 'react-router-dom';
import { Button, Icon, PageContainer } from '@mymoney/ui';
import { TransactionForm } from '../../../features/transactions/ui/TransactionForm';

export function NewTransactionPage() {
  const navigate = useNavigate();

  return (
    <PageContainer fullWidth>
      <PageContainer.Header
        title="Nueva Transacción"
        description="Registra un ingreso, gasto o transferencia"
        backTo={() => navigate(-1)}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <TransactionForm />
      </PageContainer.Body>
    </PageContainer>
  );
}
