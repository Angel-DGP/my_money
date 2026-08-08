import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { useCreateSubscription } from '../../features/catalogs/api/useCatalogs';
import { SubscriptionForm } from '../../features/catalogs/ui/SubscriptionForm';

export function NewSubscriptionPage() {
  const navigate = useNavigate();
  const createSubscription = useCreateSubscription();

  const handleSubmit = (data: any) => {
    // Basic conversion for currency / amounts if needed, for now pass through
    const payload = {
      ...data,
      currency: 'USD',
    };
    createSubscription.mutate(payload, {
      onSuccess: () => {
        navigate('/catalogs/subscriptions');
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Suscripción"
        description="Controla tus gastos recurrentes y alertas de pago."
        backTo={() => navigate('/catalogs/subscriptions')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <SubscriptionForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs/subscriptions')}
          isLoading={createSubscription.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
