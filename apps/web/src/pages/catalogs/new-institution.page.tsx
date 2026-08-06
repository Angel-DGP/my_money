import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, PageContainer } from '@mymoney/ui';
import { useCreateInstitution } from '../../features/catalogs/api/useCatalogs';
import { InstitutionForm } from '../../features/catalogs/ui/InstitutionForm';

export function NewInstitutionPage() {
  const navigate = useNavigate();
  const createInstitution = useCreateInstitution();

  const handleSubmit = (data: any) => {
    createInstitution.mutate(data, {
      onSuccess: () => {
        navigate('/catalogs');
      }
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
          onCancel={() => navigate('/catalogs')}
          isLoading={createInstitution.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
