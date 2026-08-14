import { Input, Label, Select, ColorPicker, NumberInput, DatePicker, Icon } from '@mymoney/ui';
import { useAccountsQuery, type Account } from '@entities/account';
import type { GoalFormFieldsProps } from './GoalForm.types';

export function GoalFormFields({ form, isView, isLoading }: GoalFormFieldsProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const { data: accountsResponse } = useAccountsQuery();
  
  // Safely typing accounts
  const accounts: Account[] = Array.isArray(accountsResponse) ? accountsResponse : [];

  const color = watch('color');

  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: DEFINICIÓN DE LA META ──────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="target" size="sm" className="text-brand-500" />
            Definición de la Meta
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Establece tu objetivo principal y dale una identidad visual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name" required>Nombre de la Meta</Label>
            <Input
              id="name"
              disabled={isView || isLoading}
              required
              placeholder="Ej: Ahorro para vacaciones"
              {...register('name')}
            />
            {errors.name && <p className="text-error-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <NumberInput
              id="target_amount"
              label="Objetivo (Monto a alcanzar)"
              prefix="$"
              min={0}
              step={10}
              disabled={isView || isLoading}
              required
              placeholder="Ej: 5000.00"
              value={watch('target_amount')}
              onChange={(val) => setValue('target_amount', val || 0, { shouldValidate: true })}
              error={errors.target_amount?.message}
            />
          </div>

          <div className="col-span-12 space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              disabled={isView || isLoading}
              placeholder="Ej: Viaje a Japón en 2027"
              {...register('description')}
            />
            {errors.description && <p className="text-error-500 text-xs">{errors.description.message}</p>}
          </div>
          
          <div className="col-span-12 space-y-2 pt-2">
            <ColorPicker
              id="color"
              name="color"
              label="Color de la Meta"
              value={color || '#3B82F6'}
              onChange={(c) => setValue('color', c)}
              disabled={isView || isLoading}
            />
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: PLANIFICACIÓN Y VÍNCULOS ─────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="calendar" size="sm" className="text-brand-500" />
            Planificación y Vínculos
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Organiza el tiempo y vincula cuentas para automatizar el seguimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-4 space-y-2">
            <DatePicker
              id="target_date"
              label="Fecha Objetivo (Opcional)"
              disabled={isView || isLoading}
              value={watch('target_date')}
              onChange={(d) => setValue('target_date', d, { shouldValidate: true })}
              error={errors.target_date?.message}
            />
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select
              id="priority"
              label="Prioridad"
              disabled={isView || isLoading}
              required
              {...register('priority')}
              placeholder="Seleccionar prioridad..."
            >
              <option value="1">Alta (1)</option>
              <option value="2">Media (2)</option>
              <option value="3">Baja (3)</option>
            </Select>
            {errors.priority && <p className="text-error-500 text-xs">{errors.priority.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select
              id="account_id"
              label="Cuenta Vinculada (Opcional)"
              disabled={isView || isLoading}
              {...register('account_id')}
              placeholder="Seleccionar cuenta..."
            >
              <option value="none">Ninguna</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
              ))}
            </Select>
            {errors.account_id && <p className="text-error-500 text-xs">{errors.account_id.message}</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
