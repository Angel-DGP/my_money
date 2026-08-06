import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { TransactionForm } from '../../../features/transactions/ui/TransactionForm';

export function EditTransactionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const transaction = location.state?.transaction;

  if (!transaction) {
    return <Navigate to="/transactions" replace />;
  }

  return (
    <PageContainer fullWidth>
      <PageContainer.Header
        title="Editar Transacción"
        description="Actualiza o elimina los detalles del movimiento"
        backTo={() => navigate(-1)}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <TransactionForm initialData={transaction} />
      </PageContainer.Body>
    </PageContainer>
  );
}
