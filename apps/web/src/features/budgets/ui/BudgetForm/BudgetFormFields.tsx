import { Input, Label, Select, Switch, NumberInput, DatePicker, Icon } from '@mymoney/ui';
import { CategorySelect } from '../../../categories';
import type { BudgetFormFieldsProps } from './BudgetForm.types';

export function BudgetFormFields({ form, isEdit, isView, isLoading }: BudgetFormFieldsProps) {
  const { register, watch, setValue, formState: { errors } } = form;

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
              value={watch('category_id')}
              onChange={(val: string) => setValue('category_id', val, { shouldValidate: true })}
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
            <NumberInput
              id="amount"
              label="Límite del Presupuesto"
              prefix="$"
              min={0}
              step={10}
              disabled={isView || isLoading}
              required
              placeholder="Ej: 500.00"
              value={watch('amount')}
              onChange={(val) => setValue('amount', val || 0, { shouldValidate: true })}
              error={errors.amount?.message}
            />
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
            <DatePicker
              id="start_date"
              label="Fecha de Inicio"
              disabled={isView || isEdit || isLoading}
              required
              value={watch('start_date')}
              onChange={(d) => setValue('start_date', d, { shouldValidate: true })}
              error={errors.start_date?.message}
            />
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
            <NumberInput
              id="alert_threshold"
              label="Umbral de Alerta (%)"
              min={1}
              max={100}
              suffix="%"
              placeholder="Ej: 80"
              disabled={isView || isLoading}
              value={watch('alert_threshold') ?? undefined}
              onChange={(val) => setValue('alert_threshold', (val ?? undefined) as unknown as number)}
              error={errors.alert_threshold?.message}
            />
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <NumberInput
              id="soft_limit"
              label="Límite Flexible (Aviso visual)"
              prefix="$"
              min={0}
              step={10}
              placeholder="Aviso visual"
              disabled={isView || isLoading}
              value={watch('soft_limit') ?? undefined}
              onChange={(val) => setValue('soft_limit', (val ?? undefined) as unknown as number)}
              error={errors.soft_limit?.message}
            />
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <NumberInput
              id="hard_limit"
              label="Límite Estricto (Bloqueo / Rojo)"
              prefix="$"
              min={0}
              step={10}
              placeholder="Bloqueo o alerta roja"
              disabled={isView || isLoading}
              value={watch('hard_limit') ?? undefined}
              onChange={(val) => setValue('hard_limit', (val ?? undefined) as unknown as number)}
              error={errors.hard_limit?.message}
            />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-2/40 p-5 rounded-2xl border border-border-subtle">
          <Switch
            id="carry_over"
            disabled={isView || isLoading}
            label="Rollover (Trasladar saldo)"
            description="Trasladar saldo sobrante al siguiente periodo automáticamente."
            checked={watch('carry_over')}
            onChange={(checked) => setValue('carry_over', checked)}
          />
          <Switch
            id="ignore_refunds"
            disabled={isView || isLoading}
            label="Ignorar reembolsos"
            description="No computar devoluciones en el gasto acumulado."
            checked={watch('ignore_refunds')}
            onChange={(checked) => setValue('ignore_refunds', checked)}
          />
          <Switch
            id="ignore_transfers"
            disabled={isView || isLoading}
            label="Ignorar transferencias"
            description="No incluir movimientos entre tus propias cuentas."
            checked={watch('ignore_transfers')}
            onChange={(checked) => setValue('ignore_transfers', checked)}
          />
          {isEdit && (
            <Switch
              id="is_frozen"
              disabled={isView || isLoading}
              label="Congelar presupuesto"
              description="Pausar y no actualizar saldo con nuevos gastos."
              checked={watch('is_frozen')}
              onChange={(checked) => setValue('is_frozen', checked)}
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
