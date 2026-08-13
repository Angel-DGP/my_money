import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { BudgetForm } from '@features/budgets';
import { useUpdateBudget, useBudgetsQuery } from '@entities/budget';
import { useCategoriesQuery } from '@entities/category';
import { QueryState } from '@shared/ui/QueryState';

import type { CreateBudgetDto, UpdateBudgetDto } from '@entities/budget';

export function EditBudgetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isView = location.state?.isView;

  const updateBudget = useUpdateBudget();
  const { data: budgets, isLoading, isError, error } = useBudgetsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const budget = budgets?.find(b => b.id === id);
  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  const handleSubmit = (data: CreateBudgetDto | UpdateBudgetDto) => {
    if (!id) return;
    updateBudget.mutate({ id, data: data as UpdateBudgetDto }, {
      onSuccess: () => {
        toast({
          title: 'Presupuesto actualizado',
          description: 'Los cambios se han guardado exitosamente.',
          variant: 'success',
        });
        navigate('/planning?tab=budgets');
      },
      onError: () => {
        toast({
          title: 'Error al actualizar',
          description: 'No se pudieron guardar los cambios. Intenta de nuevo.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title={isView ? "Ver Presupuesto" : "Editar Presupuesto"}
        description={isView ? "Detalles de tu límite de gasto" : "Modifica el límite del presupuesto"}
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <QueryState 
          data={budget}
          isLoading={isLoading}
          isError={isError}
          error={error}
        >
          {(b) => (
            <BudgetForm
              initialData={b}
              isView={isView}
              categories={categoryOptions}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/budgets')}
              isLoading={updateBudget.isPending}
            />
          )}
        </QueryState>
      </PageContainer.Body>
    </PageContainer>
  );
}
