import { Input, Label, Select, ColorPicker } from '@mymoney/ui';
import { useAccountsQuery, type Account } from '@entities/account';
import type { GoalFormFieldsProps } from './GoalForm.types';

export function GoalFormFields({ form, isLoading }: GoalFormFieldsProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const { data: accountsResponse } = useAccountsQuery();
  
  // Safely typing accounts
  const accounts: Account[] = Array.isArray(accountsResponse) ? accountsResponse : [];

  const color = watch('color');

  return (
    <>
      <div className="col-span-12 space-y-2">
        <Label htmlFor="name">Nombre de la Meta</Label>
        <Input
          id="name"
          disabled={isLoading}
          required
          placeholder="Ej: Ahorro para vacaciones"
          {...register('name')}
        />
        {errors.name && <p className="text-error-500 text-xs">{errors.name.message}</p>}
      </div>

      <div className="col-span-12 space-y-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Input
          id="description"
          disabled={isLoading}
          placeholder="Ej: Viaje a Japón en 2027"
          {...register('description')}
        />
        {errors.description && <p className="text-error-500 text-xs">{errors.description.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="target_amount">Objetivo</Label>
        <Input
          id="target_amount"
          type="number"
          step="0.01"
          min="0"
          disabled={isLoading}
          required
          placeholder="Ej: 5000.00"
          {...register('target_amount', { valueAsNumber: true })}
        />
        {errors.target_amount && <p className="text-error-500 text-xs">{errors.target_amount.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Select
          id="priority"
          label="Prioridad"
          disabled={isLoading}
          {...register('priority')}
        >
          <option value="1">Alta (1)</option>
          <option value="2">Media (2)</option>
          <option value="3">Baja (3)</option>
        </Select>
        {errors.priority && <p className="text-error-500 text-xs">{errors.priority.message}</p>}
      </div>
      
      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="target_date">Fecha Objetivo (Opcional)</Label>
        <Input
          id="target_date"
          type="date"
          disabled={isLoading}
          {...register('target_date')}
        />
        {errors.target_date && <p className="text-error-500 text-xs">{errors.target_date.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Select
          id="account_id"
          label="Cuenta Vinculada (Opcional)"
          disabled={isLoading}
          {...register('account_id')}
        >
          <option value="">Ninguna</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
          ))}
        </Select>
        {errors.account_id && <p className="text-error-500 text-xs">{errors.account_id.message}</p>}
      </div>
      
      <div className="col-span-12 space-y-2">
        <ColorPicker
          id="color"
          name="color"
          label="Color de la Meta"
          value={color || '#3B82F6'}
          onChange={(c) => setValue('color', c)}
          disabled={isLoading}
        />
      </div>
    </>
  );
}
