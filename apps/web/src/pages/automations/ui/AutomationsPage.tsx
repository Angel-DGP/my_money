import { useNavigate } from 'react-router-dom';
import { Button, Icon, toast, PageContainer } from '@mymoney/ui';
import { useAutoRules, useUpdateAutoRule, useDeleteAutoRule } from '@entities/automation';
import type { AutoRuleDto } from '@entities/automation';
import { AutomationsTable } from '@features/automations/ui/AutomationsTable';

export function AutomationsPage() {
  const navigate = useNavigate();
  const { data: rules = [], isLoading } = useAutoRules();
  const updateMutation = useUpdateAutoRule();
  const deleteMutation = useDeleteAutoRule();

  const handleOpenCreate = () => {
    navigate('/automations/new');
  };

  const handleOpenEdit = (rule: AutoRuleDto) => {
    navigate(`/automations/${rule.id}/edit`);
  };

  const handleDelete = (rule: AutoRuleDto) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la regla "${rule.name}"?`)) {
      deleteMutation.mutate(rule.id, {
        onSuccess: () => toast({ title: 'Regla eliminada', variant: 'success' }),
        onError: () => toast({ title: 'Error al eliminar la regla', variant: 'error' }),
      });
    }
  };

  const handleToggleActive = (rule: AutoRuleDto, isActive: boolean) => {
    updateMutation.mutate(
      { id: rule.id, dto: { is_active: isActive } },
      {
        onSuccess: () => toast({ title: isActive ? 'Regla activada' : 'Regla desactivada', variant: 'success' }),
        onError: () => toast({ title: 'Error al cambiar el estado de la regla', variant: 'error' }),
      }
    );
  };

  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Automatizaciones"
        description="Configura reglas para mover dinero, crear reservas o recibir alertas automáticamente."
        actions={
          <Button onClick={handleOpenCreate}>
            <Icon name="plus" className="mr-2" size="sm" />
            Nueva Regla
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Cargando reglas...</div>
        ) : (
          <AutomationsTable 
            rules={rules} 
            onEdit={handleOpenEdit} 
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      </PageContainer.Body>
    </PageContainer>
  );
}
