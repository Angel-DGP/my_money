import { useNavigate } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import { useCreateProductService } from "../../features/catalogs/api/useCatalogs";
import { ProductServiceForm } from "../../features/catalogs/ui/ProductServiceForm";
import type { ProductFormData } from "../../features/catalogs/ui/ProductServiceForm";

export function NewProductServicePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProductService();

  const handleSubmit = (data: ProductFormData) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        toast({ title: "Comercio creado", variant: "success" });
        navigate("/catalogs/products-services");
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
        title="Nuevo Producto o Servicio"
        description="Registra un comercio frecuente para tus transacciones."
        backTo={() => navigate("/catalogs/products")}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <ProductServiceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/catalogs/products")}
          isLoading={createProduct.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
