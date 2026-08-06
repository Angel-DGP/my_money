import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, PageContainer } from '@mymoney/ui';
import { useCreateProductService } from '../../features/catalogs/api/useCatalogs';
import { ProductServiceForm } from '../../features/catalogs/ui/ProductServiceForm';

export function NewProductServicePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProductService();

  const handleSubmit = (data: any) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        navigate('/catalogs');
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nuevo Producto o Servicio"
        description="Registra un comercio frecuente para tus transacciones."
        backTo={() => navigate(-1)}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <ProductServiceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/catalogs')}
          isLoading={createProduct.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
