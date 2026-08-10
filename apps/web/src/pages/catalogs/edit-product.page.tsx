import { useParams, useNavigate } from "react-router-dom";
import { PageContainer, toast } from "@mymoney/ui";
import {
  useProductServices,
  useUpdateProductService,
} from "../../features/catalogs/api/useCatalogs";
import { ProductServiceForm } from "../../features/catalogs/ui/ProductServiceForm";
import type { ProductFormData } from "../../features/catalogs/ui/ProductServiceForm";

export function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: products } = useProductServices();
  const updateProduct = useUpdateProductService();

  const product = products?.find((p) => p.id === id);

  if (!product) return null;

  const handleSubmit = (data: ProductFormData) => {
    if (!id) return;
    updateProduct.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast({ title: "Comercio actualizado", variant: "success" });
          navigate("/catalogs/products-services");
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

  return (
    <PageContainer>
      <PageContainer.Header
        title="Editar Producto o Servicio"
        description="Actualiza la información del comercio o servicio."
        backTo={() => navigate("/catalogs/products")}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <ProductServiceForm
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/catalogs/products")}
          isLoading={updateProduct.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
