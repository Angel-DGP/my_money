import { useNavigate } from 'react-router-dom';
import { Button, Icon, useToast, PageContainer, AlertDialog } from '@mymoney/ui';
import { useState } from 'react';
import { 
  useBudgetsQuery, 
  useDeleteBudget 
} from '@entities/budget';
import type { BudgetDto } from '@entities/budget';
import { useCategoriesQuery } from '@entities/category';
import { BudgetsTable } from '@features/budgets';
import { QueryState } from '@shared/ui/QueryState';

export function BudgetsListWidget() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: response, isLoading, isError, error } = useBudgetsQuery();
  const { data: categoriesResponse } = useCategoriesQuery();
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetDto | null>(null);

  const deleteBudget = useDeleteBudget();


  const categoriesList = categoriesResponse || [];
  
  const categoryMap = categoriesList.reduce((acc: Record<string, string>, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);



  const handleOpenCreate = () => {
    navigate('/budgets/new');
  };

  const handleOpenView = (budget: BudgetDto) => {
    navigate(`/budgets/${budget.id}/edit`, { state: { isView: true } });
  };

  const handleOpenEdit = (budget: BudgetDto) => {
    navigate(`/budgets/${budget.id}/edit`);
  };

  const handleDelete = (budget: BudgetDto) => {
    setBudgetToDelete(budget);
  };
  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Presupuestos"
        description="Establece límites para mantener tus gastos bajo control."
        actions={
          <Button onClick={handleOpenCreate} aria-label="Nuevo Presupuesto" size="sm" className="px-3 sm:px-4">
            <Icon name="plus" size="sm" className="sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Presupuesto</span>
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
      <QueryState
        data={response}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No hay presupuestos"
        emptyDescription="Crea tu primer presupuesto"
        emptyIcon="pie-chart"
      >
        {(budgets) => (
          <BudgetsTable categories={categoryMap}  
            budgets={budgets} 
            onView={handleOpenView}
            onEdit={handleOpenEdit} 
            onDelete={handleDelete} 
          />
        )}
      </QueryState>
      </PageContainer.Body>

      <AlertDialog
        open={!!budgetToDelete}
        onOpenChange={(open) => !open && setBudgetToDelete(null)}
        title="Eliminar Presupuesto"
        description={`¿Eliminar el presupuesto para ${budgetToDelete ? (categoryMap[budgetToDelete.category_id] || 'esta categoría') : ''}? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Sí, eliminar"
        isLoading={deleteBudget.isPending}
        onConfirm={() => {
          if (budgetToDelete) {
            deleteBudget.mutate(budgetToDelete.id, {
              onSuccess: () => {
                setBudgetToDelete(null);
                toast({ title: 'Éxito', description: 'Presupuesto eliminado', variant: 'success' });
              },
              onError: (error: unknown) => {
                toast({ title: 'Error', description: (error as Error).message || 'No se pudo eliminar', variant: 'error' });
              }
            });
          }
        }}
      />
    </PageContainer>
  );
}
