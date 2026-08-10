import { useNavigate, useParams } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import {
  useUpdateCard,
  useCards,
} from "../../features/catalogs/api/useCatalogs";
import { CardForm } from "../../features/catalogs/ui/CardForm";
import type { CardFormData } from "../../features/catalogs/ui/CardForm";

export function EditCardPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const updateCard = useUpdateCard();
  const { data: cards, isLoading: isLoadingCards } = useCards();

  const cardToEdit = cards?.find((c) => c.id === id);

  const handleSubmit = (data: CardFormData) => {
    if (!id) return;
    updateCard.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast({ title: "Tarjeta actualizada", variant: "success" });
          navigate("/catalogs/cards");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "No se pudo actualizar",
            variant: "error",
          });
        },
      },
    );
  };

  if (isLoadingCards) {
    return (
      <PageContainer>
        <PageContainer.Header
          title="Cargando..."
          backTo={() => navigate("/catalogs/cards")}
        />
      </PageContainer>
    );
  }

  if (!cardToEdit) {
    return (
      <PageContainer>
        <PageContainer.Header
          title="Tarjeta no encontrada"
          backTo={() => navigate("/catalogs/cards")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContainer.Header
        title="Editar Tarjeta"
        description="Modifica los detalles de la tarjeta seleccionada."
        backTo={() => navigate("/catalogs/cards")}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardForm
          initialData={cardToEdit}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/catalogs/cards")}
          isLoading={updateCard.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
