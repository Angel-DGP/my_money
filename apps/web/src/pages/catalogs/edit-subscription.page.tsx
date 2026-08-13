import { useNavigate, useParams } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import {
  SubscriptionForm,
  type SubscriptionFormData,
} from "../../features/catalogs/ui/SubscriptionForm";
import {
  useSubscriptions,
  useUpdateSubscription,
} from "../../features/catalogs/api/useCatalogs";

export function EditSubscriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: subscriptions, isLoading: isLoadingSubs } = useSubscriptions();
  const updateSubscription = useUpdateSubscription();

  const subscription = subscriptions?.find((s) => s.id === id);

  const handleSubmit = async (data: SubscriptionFormData) => {
    if (!id) return;
    try {
      const payload = {
        ...data,
        currency: 'USD',
      };
      await updateSubscription.mutateAsync({ id, data: payload });
      toast({ title: 'Suscripción actualizada', variant: 'success' });
      navigate('/catalogs/subscriptions');
    } catch {
      // Handled by global error interceptor
    }
  };

  const handleCancel = () => {
    navigate("/catalogs/subscriptions");
  };

  if (isLoadingSubs) {
    return (
      <PageContainer>
        <PageContainer.Header
          title="Editar Suscripción"
          description="Cargando..."
        />
        <PageContainer.Body>
          <div className="flex items-center justify-center p-12 text-text-secondary">
            Cargando suscripción...
          </div>
        </PageContainer.Body>
      </PageContainer>
    );
  }

  if (!subscription) {
    return (
      <PageContainer>
        <PageContainer.Header
          title="Editar Suscripción"
          description="Suscripción no encontrada."
        />
        <PageContainer.Body>
          <div className="flex flex-col items-center justify-center p-12 text-text-secondary gap-4">
            <p>La suscripción que intentas editar no existe o fue eliminada.</p>
            <button
              onClick={handleCancel}
              className="text-primary-500 hover:underline"
            >
              Volver a suscripciones
            </button>
          </div>
        </PageContainer.Body>
      </PageContainer>
    );
  }

  const initialData: SubscriptionFormData = {
    name: subscription.name,
    amount: Number(subscription.amount),
    category_id: subscription.category_id || "",
    next_billing_date: subscription.next_billing_date
      ? new Date(subscription.next_billing_date).toISOString().split("T")[0] ||
        ""
      : "",
    billing_cycle: subscription.billing_cycle as "MONTHLY" | "YEARLY",
    card_id: subscription.card_id,
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Editar Suscripción"
        description="Modifica los detalles de tu servicio recurrente."
      />
      <PageContainer.Body>
        <SubscriptionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateSubscription.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
