import { useTransactionsQuery } from '@entities/transaction';
import { TransactionsTable } from '@features/transactions';
import { Button, Icon, PageContainer, Text } from '@mymoney/ui';
import { useNavigate } from 'react-router-dom';

export function TransactionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTransactionsQuery({ page: 1, limit: 15 });

  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Transacciones"
        description="Historial completo de tus movimientos"
        actions={
          <Button onClick={() => navigate('/transactions/new')}>
            <Icon name="plus" size="sm" className="mr-2" />
            Nueva Transacción
          </Button>
        }
      />
      <PageContainer.Body variant="transparent" className="p-0 border-none shadow-none bg-transparent">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-error-500">Error al cargar transacciones</div>
        ) : data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
              <Icon name="repeat" size="lg" className="text-text-muted" />
            </div>
            <Text weight="medium" className="mb-2">No hay transacciones</Text>
            <Text variant="muted" className="max-w-sm">No has registrado ningún movimiento. Cuando lo hagas, aparecerán aquí.</Text>
          </div>
        ) : (
          <>
            <TransactionsTable 
              transactions={data || []}
              onTransactionClick={(tx) => navigate('/transactions/edit', { state: { transaction: tx } })} 
            />

            {/* Paginación - Omitido temporalmente ya que API no expone meta aún */}
          </>
        )}
      </PageContainer.Body>
    </PageContainer>
  );
}
