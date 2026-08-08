import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { TransactionForm } from '../../../features/transactions/ui/TransactionForm';

export function EditTransactionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const transaction = location.state?.transaction;
  const isView = location.state?.isView;

  if (!transaction) {
    return <Navigate to="/transactions" replace />;
  }

  return (
    <PageContainer fullWidth>
      <PageContainer.Header
        title={isView ? "Ver Transacción" : "Editar Transacción"}
        description={isView ? "Detalles del movimiento" : "Actualiza o elimina los detalles del movimiento"}
        backTo={() => navigate(-1)}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <TransactionForm initialData={transaction} isView={isView} />
      </PageContainer.Body>
    </PageContainer>
  );
}
