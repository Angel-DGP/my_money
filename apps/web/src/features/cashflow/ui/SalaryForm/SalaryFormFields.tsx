import { Input, Select, Icon } from '@mymoney/ui';
import { useAccountsQuery, type Account } from '@entities/account';
import type { UseFormReturn } from 'react-hook-form';
import type { SalaryFormData } from './SalaryForm.schema';

interface SalaryFormFieldsProps {
  form: UseFormReturn<SalaryFormData>;
}

export function SalaryFormFields({ form }: SalaryFormFieldsProps) {
  const { register, formState: { errors } } = form;
  const { data: accounts = [] } = useAccountsQuery();

  return (
    <>
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="briefcase" size="sm" className="text-brand-500" />
            Detalles del Sueldo
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Registra tu ingreso recurrente para que se refleje en tus proyecciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select 
              id="accountId" 
              label="Cuenta Destino" 
              required 
              error={errors.accountId?.message} 
              {...register('accountId')} 
              placeholder="Seleccionar cuenta..."
            >
              {accounts.map((acc: Account) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Input
              id="amount"
              label="Sueldo (Ingreso)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              leftIcon="dollar-sign"
              required
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          
          <div className="col-span-12 md:col-span-12 space-y-2">
            <Input
              label="Descripción"
              {...register('description')}
              error={errors.description?.message}
              placeholder="Ej: Sueldo Quincena 1"
            />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Input
              type="date"
              label="Fecha de Inicio"
              leftIcon="calendar"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
          </div>
          
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Input
              type="number"
              label="Meses a Proyectar"
              {...register('months')}
              error={errors.months?.message}
              placeholder="Ej: 12"
              helperText="¿Por cuántos meses deseas registrar este ingreso?"
            />
          </div>
        </div>
      </div>
    </>
  );
}
