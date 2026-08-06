import { useNavigate, useParams } from 'react-router-dom';
import { Card, toast, Button, Icon } from '@mymoney/ui';
import { useAutoRules, useUpdateAutoRule } from '@entities/automation';
import type { CreateAutoRuleDto, UpdateAutoRuleDto } from '@entities/automation';
import { AutoRuleForm } from '@features/automations/ui/AutoRuleForm';

export function EditAutomationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rules = [], isLoading } = useAutoRules();
  const updateMutation = useUpdateAutoRule();

  const ruleToEdit = rules.find((r) => r.id === id);

  const handleSubmit = (data: CreateAutoRuleDto) => {
    if (!id) return;
    
    updateMutation.mutate(
      { id, dto: data as UpdateAutoRuleDto },
      {
        onSuccess: () => {
          toast({ title: 'Regla actualizada correctamente', variant: 'success' });
          navigate('/automations');
        },
        onError: () => toast({ title: 'Error al actualizar la regla', variant: 'error' }),
      }
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center">Cargando regla...</div>;
  }

  if (!ruleToEdit) {
    return <div className="p-8 text-center text-error-500">Regla no encontrada</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/automations')} className="px-2">
          <Icon name="chevron-left" size="sm" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Editar Automatización</h2>
          <p className="text-sm text-text-secondary mt-1">Modifica la configuración de esta regla automática.</p>
        </div>
      </div>
      
      <Card className="p-6">
        <AutoRuleForm 
          initialData={ruleToEdit}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </Card>
    </div>
  );
}
