import { Input, Label, Select, Checkbox, Icon } from '@mymoney/ui';
import { CategorySelect } from '../../../categories';
import type { BudgetFormFieldsProps } from './BudgetForm.types';

export function BudgetFormFields({ form, isEdit, isView, isLoading }: BudgetFormFieldsProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: DETALLES PRINCIPALES ───────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="pie-chart" size="sm" className="text-brand-500" />
            Detalles del Presupuesto
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Define la categoría y los límites básicos de tu presupuesto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <CategorySelect
              id="category_id"
              label="Categoría"
              value={form.watch('category_id')}
              onChange={(val) => form.setValue('category_id', val, { shouldValidate: true })}
              filterType="EXPENSE"
              disabled={isView || isEdit || isLoading}
              required
              error={errors.category_id?.message}
            />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="period"
              label="Periodo"
              disabled={isView || isEdit || isLoading}
              required
              {...register('period')}
              placeholder="Seleccionar periodo..."
            >
              <option value="MONTHLY">Mensual</option>
              <option value="YEARLY">Anual</option>
            </Select>
            {errors.period && <p className="text-error-500 text-xs">{errors.period.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="amount" required>Límite</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              disabled={isView || isLoading}
              required
              placeholder="Ej: 500.00"
              leftIcon="dollar-sign"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-error-500 text-xs">{errors.amount.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="currency" required>Moneda</Label>
            <Input
              id="currency"
              disabled={isView || isLoading}
              required
              placeholder="Ej: USD, EUR, MXN"
              {...register('currency')}
            />
            {errors.currency && <p className="text-error-500 text-xs">{errors.currency.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="start_date" required>Fecha de Inicio</Label>
            <Input
              id="start_date"
              type="date"
              disabled={isView || isEdit || isLoading}
              required
              leftIcon="calendar"
              {...register('start_date')}
            />
            {errors.start_date && <p className="text-error-500 text-xs">{errors.start_date.message}</p>}
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: LÍMITES Y ALERTAS (OPCIONALES) ─────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="alert-triangle" size="sm" className="text-brand-500" />
            Límites Secundarios y Alertas
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Configura notificaciones y niveles de control adicionales opcionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="alert_threshold">Umbral de Alerta (%)</Label>
            <Input
              id="alert_threshold"
              type="number"
              min="1"
              max="100"
              placeholder="Ej: 80"
              disabled={isView || isLoading}
              rightIcon="info"
              {...register('alert_threshold', { valueAsNumber: true })}
            />
            {errors.alert_threshold && <p className="text-error-500 text-xs">{errors.alert_threshold.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="soft_limit">Límite Flexible</Label>
            <Input
              id="soft_limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="Aviso visual"
              disabled={isView || isLoading}
              leftIcon="dollar-sign"
              {...register('soft_limit', { valueAsNumber: true })}
            />
            {errors.soft_limit && <p className="text-error-500 text-xs">{errors.soft_limit.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="hard_limit">Límite Estricto</Label>
            <Input
              id="hard_limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="Bloqueo o alerta roja"
              disabled={isView || isLoading}
              leftIcon="dollar-sign"
              {...register('hard_limit', { valueAsNumber: true })}
            />
            {errors.hard_limit && <p className="text-error-500 text-xs">{errors.hard_limit.message}</p>}
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: CONFIGURACIÓN Y NOTAS ──────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="settings" size="sm" className="text-brand-500" />
            Configuración Adicional
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Ajustes avanzados sobre el comportamiento del presupuesto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-2/40 p-5 rounded-xl border border-border-subtle">
          <Checkbox
            disabled={isView || isLoading}
            label="Trasladar saldo sobrante al siguiente mes (Rollover)"
            {...register('carry_over')}
          />
          <Checkbox
            disabled={isView || isLoading}
            label="Ignorar reembolsos"
            {...register('ignore_refunds')}
          />
          <Checkbox
            disabled={isView || isLoading}
            label="Ignorar transferencias entre cuentas"
            {...register('ignore_transfers')}
          />
          {isEdit && (
            <Checkbox
              disabled={isView || isLoading}
              label="Congelar presupuesto (No actualizar saldo)"
              {...register('is_frozen')}
            />
          )}
        </div>

        <div className="col-span-12 pt-2 space-y-2">
          <Label htmlFor="notes">Notas (Opcional)</Label>
          <Input
            id="notes"
            disabled={isView || isLoading}
            placeholder="Añade algún comentario o detalle sobre este presupuesto..."
            {...register('notes')}
          />
          {errors.notes && <p className="text-error-500 text-xs">{errors.notes.message}</p>}
        </div>
      </div>

    </div>
  );
}
