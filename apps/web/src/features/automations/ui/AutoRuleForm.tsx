import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Select, Label, Checkbox, FormLayout, PageContainer } from '@mymoney/ui';
import { TriggerType, ActionType } from '@entities/automation';
import type { CreateAutoRuleDto, AutoRuleDto } from '@entities/automation';

interface AutoRuleFormProps {
  initialData?: AutoRuleDto;
  onSubmit: (data: CreateAutoRuleDto) => void;
  isSubmitting?: boolean;
}

const triggerOptions = [
  { value: TriggerType.INCOME_RECEIVED, label: 'Al recibir ingresos' },
  { value: TriggerType.BUDGET_THRESHOLD, label: 'Límite de presupuesto superado' },
  { value: TriggerType.MONTH_END, label: 'Al finalizar el mes' },
  { value: TriggerType.CUSTOM, label: 'Personalizado' },
];

const actionOptions = [
  { value: ActionType.MOVE_TO_GOAL, label: 'Mover a meta de ahorro' },
  { value: ActionType.RESERVE_AMOUNT, label: 'Reservar dinero' },
  { value: ActionType.ALERT_USER, label: 'Enviar notificación' },
];

export function AutoRuleForm({ initialData, onSubmit, isSubmitting }: AutoRuleFormProps) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CreateAutoRuleDto>({
    defaultValues: initialData || {
      name: '',
      description: '',
      trigger_type: TriggerType.INCOME_RECEIVED,
      action_type: ActionType.MOVE_TO_GOAL,
      is_active: true,
      conditions: {},
      action_params: {},
    },
  });

  const selectedAction = watch('action_type');

  return (
    <FormLayout onSubmit={handleSubmit(onSubmit)}>
      <div className="col-span-12 space-y-1">
          <Label htmlFor="name" id="label-name">Nombre de la Regla</Label>
          <Input 
            id="name" 
            placeholder="Ej: Ahorrar 10% de mi sueldo" 
            {...register('name', { required: 'El nombre es requerido' })}
            error={errors.name?.message as any}
          />
        </div>

        <div className="col-span-12 space-y-1">
          <Label htmlFor="description" id="label-desc">Descripción (opcional)</Label>
          <Input 
            id="description" 
            placeholder="Descripción de lo que hace esta regla" 
            {...register('description')}
          />
        </div>

        <div className="col-span-12 md:col-span-6 space-y-1">
            <Label htmlFor="trigger_type" id="label-trigger">Desencadenante (Trigger)</Label>
            <Controller
              name="trigger_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  id="trigger_type"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                >
                  {triggerOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-1">
            <Label htmlFor="action_type" id="label-action">Acción a realizar</Label>
            <Controller
              name="action_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  id="action_type"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                >
                  {actionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              )}
            />
          </div>

        <div className="col-span-12 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Configuración Específica
          </h3>
          
          {selectedAction === ActionType.MOVE_TO_GOAL && (
            <div>
              <Label htmlFor="goal_id" id="label-goal">ID de Meta Destino</Label>
              <Input 
                id="goal_id"
                placeholder="ID de la meta" 
                {...register('action_params.goalId')} 
              />
              <p className="text-xs text-slate-500 mt-1">
                El dinero será transferido a esta meta cuando la regla se cumpla.
              </p>
            </div>
          )}

          {selectedAction === ActionType.ALERT_USER && (
            <div>
              <Label htmlFor="alert_msg" id="label-alert">Mensaje de Alerta</Label>
              <Input 
                id="alert_msg"
                placeholder="Mensaje que deseas recibir" 
                {...register('action_params.message')} 
              />
            </div>
          )}
        </div>

        <div className="col-span-12 flex items-center space-x-2 pt-2">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                label="Regla Activa"
                description="Si está activa, la regla se ejecutará cuando ocurra el desencadenante."
              />
            )}
          />
        </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="submit" disabled={!!isSubmitting}>
          {isSubmitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Regla'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
