import { useState } from 'react';
import { Input, Label, Select, Checkbox, Button } from '@mymoney/ui';
import type { BudgetFormFieldsProps } from './BudgetForm.types';

export function BudgetFormFields({ form, categories, isEdit, isLoading }: BudgetFormFieldsProps) {
  const { register, formState: { errors } } = form;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <div className="col-span-12 space-y-2">
        <Select
          id="category_id"
          label="Categoría"
          disabled={isEdit || isLoading}
          required
          {...register('category_id')}
        >
          <option value="" disabled>Seleccione una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
        {errors.category_id && <p className="text-error-500 text-xs">{errors.category_id.message}</p>}
      </div>

      <div className="col-span-12 space-y-2">
        <Select
          id="period"
          label="Periodo"
          disabled={isEdit || isLoading}
          {...register('period')}
        >
          <option value="MONTHLY">Mensual</option>
          <option value="YEARLY">Anual</option>
        </Select>
        {errors.period && <p className="text-error-500 text-xs">{errors.period.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="amount">Límite</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          disabled={isLoading}
          required
          placeholder="Ej: 500.00"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-error-500 text-xs">{errors.amount.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="currency">Moneda</Label>
        <Input
          id="currency"
          disabled={isLoading}
          required
          {...register('currency')}
        />
        {errors.currency && <p className="text-error-500 text-xs">{errors.currency.message}</p>}
      </div>

      <div className="col-span-12 space-y-2">
        <Label htmlFor="start_date">Fecha de Inicio</Label>
        <Input
          id="start_date"
          type="date"
          disabled={isEdit || isLoading}
          required
          {...register('start_date')}
        />
        {errors.start_date && <p className="text-error-500 text-xs">{errors.start_date.message}</p>}
      </div>

      <div className="col-span-12 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-sm flex justify-between items-center"
        >
          <span>Opciones Avanzadas</span>
          <span>{showAdvanced ? '▲' : '▼'}</span>
        </Button>
      </div>

      {showAdvanced && (
        <div className="col-span-12 space-y-4 pt-2 pb-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
          <div className="space-y-2">
            <Label htmlFor="alert_threshold">Umbral de Alerta (%)</Label>
            <Input
              id="alert_threshold"
              type="number"
              min="1"
              max="100"
              disabled={isLoading}
              {...register('alert_threshold', { valueAsNumber: true })}
            />
            {errors.alert_threshold && <p className="text-error-500 text-xs">{errors.alert_threshold.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soft_limit">Límite Flexible (Opcional)</Label>
              <Input
                id="soft_limit"
                type="number"
                step="0.01"
                min="0"
                disabled={isLoading}
                {...register('soft_limit', { valueAsNumber: true })}
              />
              {errors.soft_limit && <p className="text-error-500 text-xs">{errors.soft_limit.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hard_limit">Límite Estricto (Opcional)</Label>
              <Input
                id="hard_limit"
                type="number"
                step="0.01"
                min="0"
                disabled={isLoading}
                {...register('hard_limit', { valueAsNumber: true })}
              />
              {errors.hard_limit && <p className="text-error-500 text-xs">{errors.hard_limit.message}</p>}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Checkbox
              disabled={isLoading}
              label="Trasladar saldo sobrante (Rollover)"
              {...register('carry_over')}
            />

            <Checkbox
              disabled={isLoading}
              label="Ignorar reembolsos"
              {...register('ignore_refunds')}
            />

            <Checkbox
              disabled={isLoading}
              label="Ignorar transferencias"
              {...register('ignore_transfers')}
            />

            {isEdit && (
              <Checkbox
                disabled={isLoading}
                label="Congelar presupuesto"
                {...register('is_frozen')}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              disabled={isLoading}
              placeholder="Ej: Solo para gastos del hogar"
              {...register('notes')}
            />
            {errors.notes && <p className="text-error-500 text-xs">{errors.notes.message}</p>}
          </div>
        </div>
      )}
    </>
  );
}
