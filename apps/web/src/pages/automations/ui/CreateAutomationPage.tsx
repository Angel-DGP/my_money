import { useNavigate } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { useCreateAutoRule } from '@entities/automation';
import type { CreateAutoRuleDto } from '@entities/automation';
import { AutoRuleForm } from '@features/automations/ui/AutoRuleForm';

export function CreateAutomationPage() {
  const navigate = useNavigate();
  const createMutation = useCreateAutoRule();

  const handleSubmit = (data: CreateAutoRuleDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: 'Regla de automatización creada', variant: 'success' });
        navigate('/automations');
      },
      onError: () => toast({ title: 'Error al crear la regla', variant: 'error' }),
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Automatización"
        description="Configura una regla para automatizar tus finanzas."
        backTo={() => navigate('/automations')}
      />
      <PageContainer.Body variant="transparent" className="py-6">
        <AutoRuleForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
