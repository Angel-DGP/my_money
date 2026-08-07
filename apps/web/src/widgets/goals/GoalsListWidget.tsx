import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, Icon, useToast, PageContainer } from '@mymoney/ui';
import { 
  useGoalsQuery, 
  useCreateGoal, 
  useAddGoalProgress 
} from '@entities/goal';
import type { GoalDto, CreateGoalDto, AddGoalProgressDto } from '@entities/goal';
import { GoalsTable } from '@features/goals';
import { GoalForm } from '@features/goals';
import { AddProgressForm } from '@features/goals';
import { QueryState } from '@shared/ui/QueryState';

type ModalState = 'NONE' | 'CREATE' | 'ADD_PROGRESS';

export function GoalsListWidget() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>('NONE');
  const [selectedGoal, setSelectedGoal] = useState<GoalDto | null>(null);

  const { data: goals, isLoading, isError, error } = useGoalsQuery();
  const createGoal = useCreateGoal();
  const addProgress = useAddGoalProgress();

  const handleOpenCreate = () => {
    navigate('/goals/new');
  };

  const handleOpenAddProgress = (goal: GoalDto) => {
    setSelectedGoal(goal);
    setModalState('ADD_PROGRESS');
  };

  const handleCloseModal = () => {
    setModalState('NONE');
    setSelectedGoal(null);
  };

  const handleCreateSubmit = (formData: CreateGoalDto) => {
    createGoal.mutate(formData, {
      onSuccess: () => {
        toast({ title: 'Éxito', description: 'Meta creada', variant: 'success' });
        handleCloseModal();
      },
      onError: (error: unknown) => {
        toast({ title: 'Error', description: (error as Error).message || 'No se pudo crear', variant: 'error' });
      }
    });
  };

  const handleAddProgressSubmit = (formData: AddGoalProgressDto) => {
    if (selectedGoal) {
      addProgress.mutate(
        { id: selectedGoal.id, data: formData },
        {
          onSuccess: () => {
            toast({ title: 'Éxito', description: 'Aporte registrado', variant: 'success' });
            handleCloseModal();
          },
          onError: (error: unknown) => {
            toast({ title: 'Error', description: (error as Error).message || 'No se pudo registrar', variant: 'error' });
          }
        }
      );
    }
  };

  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Metas de Ahorro"
        description="Empieza a ahorrar creando tu primera meta."
        actions={
          <Button onClick={handleOpenCreate}>
            <Icon name="plus" size="sm" className="mr-2" />
            Nueva Meta
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
      <QueryState
        data={goals}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyTitle="No hay metas"
        emptyDescription="Empieza a ahorrar creando tu primera meta."
        emptyIcon="target"
      >
        {(goalsData) => (
          <GoalsTable 
            goals={goalsData} 
            onAddProgress={handleOpenAddProgress} 
          />
        )}
      </QueryState>

      <Dialog.Root open={modalState !== 'NONE'} onOpenChange={(open) => !open && handleCloseModal()}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => handleCloseModal()} />
            <div className="relative z-50 grid w-full max-w-lg gap-4 rounded-xl border border-border-subtle bg-background p-6 shadow-lg sm:rounded-2xl">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {modalState === 'CREATE' ? 'Nueva Meta' : 'Aportar a Meta'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-text-secondary">
                  {modalState === 'CREATE' 
                    ? 'Define un nuevo objetivo de ahorro.' 
                    : 'Registra un avance hacia tu meta.'}
                </Dialog.Description>
              </div>
              
              <div className="mt-4">
                {modalState === 'CREATE' && (
                  <GoalForm 
                    onSubmit={(data) => handleCreateSubmit(data as CreateGoalDto)}
                    onCancel={handleCloseModal}
                    isLoading={createGoal.isPending}
                  />
                )}

                {modalState === 'ADD_PROGRESS' && selectedGoal && (
                  <AddProgressForm 
                    goalName={selectedGoal.name}
                    defaultCurrency={selectedGoal.target_amount.currency}
                    onSubmit={(data) => handleAddProgressSubmit(data as AddGoalProgressDto)}
                    onCancel={handleCloseModal}
                    isLoading={addProgress.isPending}
                  />
                )}
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
