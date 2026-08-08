import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { useCreateProductService } from '../../features/catalogs/api/useCatalogs';
import { ProductServiceForm } from '../../features/catalogs/ui/ProductServiceForm';

export function NewProductServicePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProductService();

  const handleSubmit = (data: unknown) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        navigate('/catalogs/products');
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nuevo Producto o Servicio"
        description="Registra un comercio frecuente para tus transacciones."
        backTo={() => navigate('/catalogs/products')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <ProductServiceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs/products')}
          isLoading={createProduct.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
