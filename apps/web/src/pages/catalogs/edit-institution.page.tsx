import { useNavigate, useParams } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import {
  useUpdateInstitution,
  useInstitutions,
} from "../../features/catalogs/api/useCatalogs";
import { InstitutionForm } from "../../features/catalogs/ui/InstitutionForm";
import type { InstitutionFormData } from "../../features/catalogs/ui/InstitutionForm";

export function EditInstitutionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const updateInstitution = useUpdateInstitution();
  const { data: institutions, isLoading: isLoadingInstitutions } =
    useInstitutions();

  const institutionToEdit = institutions?.find((i) => i.id === id);

  const handleSubmit = (data: InstitutionFormData) => {
    if (!id) return;
    updateInstitution.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast({ title: "Institución actualizada", variant: "success" });
          navigate("/catalogs/institutions");
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

  if (isLoadingInstitutions) {
    return (
      <PageContainer>
        <PageContainer.Header
          title="Cargando..."
          backTo={() => navigate("/catalogs/institutions")}
        />
      </PageContainer>
    );
  }

  if (!institutionToEdit) {
    return (
      <PageContainer>
        <PageContainer.Header
          title="Institución no encontrada"
          backTo={() => navigate("/catalogs/institutions")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContainer.Header
        title="Editar Institución"
        description="Modifica los detalles de la institución seleccionada."
        backTo={() => navigate("/catalogs/institutions")}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <InstitutionForm
          initialData={institutionToEdit}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/catalogs/institutions")}
          isLoading={updateInstitution.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
