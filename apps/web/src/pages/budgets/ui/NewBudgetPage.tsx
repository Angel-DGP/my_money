import { useNavigate } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { BudgetForm } from '@features/budgets';
import { useCreateBudget } from '@entities/budget';
import { useCategoriesQuery } from '@entities/category';

import type { CreateBudgetDto, UpdateBudgetDto } from '@entities/budget';

export function NewBudgetPage() {
  const navigate = useNavigate();
  const createBudget = useCreateBudget();
  const { data: categories = [] } = useCategoriesQuery();

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  const handleSubmit = (data: CreateBudgetDto | UpdateBudgetDto) => {
    createBudget.mutate(data as CreateBudgetDto, {
      onSuccess: () => {
        toast({
          title: 'Presupuesto creado',
          description: 'El presupuesto se ha creado exitosamente.',
          variant: 'success',
        });
        navigate('/planning?tab=budgets');
      },
      onError: () => {
        toast({
          title: 'Error al crear',
          description: 'No se pudo crear el presupuesto. Intenta de nuevo.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nuevo Presupuesto"
        description="Asigna límites de gasto para tus categorías"
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <BudgetForm
          categories={categoryOptions}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/budgets')}
          isLoading={createBudget.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
