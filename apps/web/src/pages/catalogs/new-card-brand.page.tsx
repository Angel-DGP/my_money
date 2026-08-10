import { useNavigate } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import { useCreateCardBrand } from "../../features/catalogs/api/useCatalogs";
import { CardBrandForm } from "../../features/catalogs/ui/CardBrandForm";
import type { CardBrandFormData } from "../../features/catalogs/ui/CardBrandForm";

export function NewCardBrandPage() {
  const navigate = useNavigate();
  const createBrand = useCreateCardBrand();

  const handleSubmit = (data: CardBrandFormData) => {
    createBrand.mutate(data, {
      onSuccess: () => {
        toast({ title: "Marca creada", variant: "success" });
        navigate("/catalogs/cards?tab=brands");
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
        title="Nueva Marca de Tarjeta"
        description="Agrega una nueva red o marca (ej. Visa, Mastercard)."
        backTo={() => navigate("/catalogs/cards?tab=brands")}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <CardBrandForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/catalogs/cards?tab=brands")}
          isLoading={createBrand.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
