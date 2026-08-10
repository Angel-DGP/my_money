import { useNavigate } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import { useCreateInstitution } from "../../features/catalogs/api/useCatalogs";
import { InstitutionForm } from "../../features/catalogs/ui/InstitutionForm";
import type { InstitutionFormData } from "../../features/catalogs/ui/InstitutionForm";

export function NewInstitutionPage() {
  const navigate = useNavigate();
  const createInstitution = useCreateInstitution();

  const handleSubmit = (data: InstitutionFormData) => {
    createInstitution.mutate(data, {
      onSuccess: () => {
        toast({ title: "Institución creada", variant: "success" });
        navigate("/catalogs/institutions");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear la institución",
          variant: "error",
        });
      },
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Institución"
        description="Agrega un banco, billetera digital o cooperativa."
        backTo={() => navigate(-1)}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <InstitutionForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/catalogs/institutions")}
          isLoading={createInstitution.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
