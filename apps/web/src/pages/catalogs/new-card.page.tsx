import { useNavigate } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import { useCreateCard } from "../../features/catalogs/api/useCatalogs";
import { CardForm } from "../../features/catalogs/ui/CardForm";
import type { CardFormData } from "../../features/catalogs/ui/CardForm";

export function NewCardPage() {
  const navigate = useNavigate();
  const createCard = useCreateCard();

  const handleSubmit = (data: CardFormData) => {
    createCard.mutate(data, {
      onSuccess: () => {
        toast({ title: "Tarjeta creada", variant: "success" });
        navigate("/catalogs/cards");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear",
          variant: "error",
        });
      },
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Tarjeta"
        description="Agrega una tarjeta para vincular a tus pagos o suscripciones."
        backTo={() => navigate("/catalogs/cards")}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/catalogs/cards")}
          isLoading={createCard.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
