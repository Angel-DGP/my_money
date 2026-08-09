import { useNavigate } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { GoalForm } from '@features/goals';
import { useCreateGoal } from '@entities/goal';
import type { CreateGoalDto, UpdateGoalDto } from '@entities/goal';

export function NewGoalPage() {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();

  const handleSubmit = (data: CreateGoalDto | UpdateGoalDto) => {
    createGoal.mutate(data as CreateGoalDto, {
      onSuccess: () => {
        toast({
          title: 'Meta creada',
          description: 'La meta de ahorro se ha creado exitosamente.',
          variant: 'success',
        });
        navigate('/goals');
      },
      onError: () => {
        toast({
          title: 'Error al crear',
          description: 'No se pudo crear la meta. Intenta de nuevo.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Meta de Ahorro"
        description="Define objetivos financieros a mediano o largo plazo"
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <GoalForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/goals')}
          isLoading={createGoal.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
