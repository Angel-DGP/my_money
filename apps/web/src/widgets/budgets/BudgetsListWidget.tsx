import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, Icon, useToast, PageContainer } from '@mymoney/ui';
import { 
  useBudgetsQuery, 
  useCreateBudget, 
  useUpdateBudget, 
  useDeleteBudget 
} from '@entities/budget';
import type { BudgetDto } from '@entities/budget';
import { useCategoriesQuery } from '@entities/category';
import { BudgetsTable } from '@features/budgets';
import { BudgetForm } from '@features/budgets';
import { QueryState } from '@shared/ui/QueryState';

export function BudgetsListWidget() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetDto | null>(null);

  const { data: response, isLoading, isError, error } = useBudgetsQuery();
  const { data: categoriesResponse } = useCategoriesQuery();

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();


  const categoriesList = categoriesResponse || [];
  
  const categoryMap = categoriesList.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  const categoryOptions = categoriesList.map((c) => ({ id: c.id, name: c.name }));

  const handleOpenCreate = () => {
    navigate('/budgets/new');
  };

  const handleOpenEdit = (budget: BudgetDto) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
  };

  const handleSubmit = (formData: any) => {
    if (selectedBudget) {
      updateBudget.mutate(
        { id: selectedBudget.id, data: formData },
        {
          onSuccess: () => {
            toast({ title: 'Éxito', description: 'Presupuesto actualizado', variant: 'success' });
            handleCloseModal();
          },
          onError: (error: any) => {
            toast({ title: 'Error', description: error.message || 'No se pudo actualizar', variant: 'error' });
          }
        }
      );
    } else {
      createBudget.mutate(formData, {
        onSuccess: () => {
          toast({ title: 'Éxito', description: 'Presupuesto creado', variant: 'success' });
          handleCloseModal();
        },
        onError: (error: any) => {
          toast({ title: 'Error', description: error.message || 'No se pudo crear', variant: 'error' });
        }
      });
    }
  };

  const handleDelete = (budget: BudgetDto) => {
    if (window.confirm(`¿Eliminar el presupuesto para ${categoryMap[budget.category_id] || 'esta categoría'}?`)) {
      deleteBudget.mutate(budget.id, {
        onSuccess: () => {
          toast({ title: 'Éxito', description: 'Presupuesto eliminado', variant: 'success' });
        },
        onError: (error: any) => {
          toast({ title: 'Error', description: error.message || 'No se pudo eliminar', variant: 'error' });
        }
      });
    }
  };

  const isFormLoading = createBudget.isPending || updateBudget.isPending;

  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Presupuestos"
        description="Establece límites para mantener tus gastos bajo control."
        actions={
          <Button onClick={handleOpenCreate}>
            <Icon name="plus" size="sm" className="mr-2" />
            Nuevo Presupuesto
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
            onEdit={handleOpenEdit} 
            onDelete={handleDelete} 
          />
        )}
      </QueryState>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)} />
            <div className="relative z-50 grid w-full max-w-lg gap-4 rounded-xl border border-border-subtle bg-background p-6 shadow-lg sm:rounded-2xl">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {selectedBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-text-secondary">
                  {selectedBudget 
                    ? 'Modifica el límite del presupuesto.' 
                    : 'Define un límite de gastos para una categoría específica.'}
                </Dialog.Description>
              </div>
              <div className="mt-4">
                <BudgetForm 
                  initialData={selectedBudget}
                  categories={categoryOptions}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseModal}
                  isLoading={isFormLoading}
                />
              </div>
              <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <Icon name="x" size="sm" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
      </PageContainer.Body>
    </PageContainer>
  );
}
