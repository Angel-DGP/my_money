import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { GoalForm } from '@features/goals';
import { useUpdateGoal, useGoalsQuery } from '@entities/goal';
import { QueryState } from '@shared/ui/QueryState';

import type { UpdateGoalDto } from '@entities/goal';

export function EditGoalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isView = location.state?.isView;

  const updateGoal = useUpdateGoal();
  const { data: goals, isLoading, isError, error } = useGoalsQuery();

  const goal = goals?.find(g => g.id === id);

  const handleSubmit = (data: UpdateGoalDto) => {
    if (!id) return;
    updateGoal.mutate({ id, data }, {
      onSuccess: () => {
        toast({
          title: 'Meta actualizada',
          description: 'Los cambios se han guardado exitosamente.',
          variant: 'success',
        });
        navigate('/goals');
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
        title={isView ? "Ver Meta de Ahorro" : "Editar Meta de Ahorro"}
        description={isView ? "Detalles de tu meta" : "Modifica los detalles de tu meta de ahorro"}
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <QueryState 
          data={goal}
          isLoading={isLoading}
          isError={isError}
          error={error}
        >
          {(g) => (
            <GoalForm
              initialData={g}
              isView={isView}
              onSubmit={handleSubmit as any}
              onCancel={() => navigate('/goals')}
              isLoading={updateGoal.isPending}
            />
          )}
        </QueryState>
      </PageContainer.Body>
    </PageContainer>
  );
}
