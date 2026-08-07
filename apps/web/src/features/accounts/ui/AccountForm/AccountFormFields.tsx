import { Input, Label, Select, MoneyInput } from '@mymoney/ui';
import { useInstitutions } from '../../../catalogs/api/useCatalogs';
import type { AccountFormFieldsProps } from './AccountForm.types';

export function AccountFormFields({ form, isEdit, isLoading }: AccountFormFieldsProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const { data: institutions } = useInstitutions();

  const initialBalance = watch('initial_balance');

  return (
    <>
      <div className="col-span-12 space-y-1">
        <Label htmlFor="name">Nombre de la cuenta</Label>
        <Input 
          id="name" 
          placeholder="Ej: Ahorros Banreservas" 
          disabled={isLoading}
          required 
          {...register('name')}
        />
        {errors.name && <p className="text-error-500 text-xs">{errors.name.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-1">
        <Select 
          id="type"
          label="Tipo General"
          disabled={isEdit || isLoading}
          {...register('type')}
        >
          <option value="CHECKING">Corriente</option>
          <option value="SAVINGS">Ahorros</option>
          <option value="CASH">Efectivo</option>
          <option value="CREDIT">Tarjeta de Crédito</option>
          <option value="INVESTMENT">Inversión</option>
        </Select>
        {errors.type && <p className="text-error-500 text-xs">{errors.type.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-1">
        <Select 
          id="institution_id"
          label="Institución (Opcional)"
          searchable
          disabled={isLoading}
          {...register('institution_id')}
        >
          <option value="">Selecciona una institución...</option>
          {institutions?.map((i: any) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </Select>
      </div>

      <div className="col-span-12 space-y-1">
        <Label htmlFor="specific_type">Tipo Específico (Ej: Ahorro Flexible) - Opcional</Label>
        <Input 
          id="specific_type" 
          placeholder="Ej: Ahorro Flexible, Plan Jubilación..." 
          disabled={isLoading}
          {...register('specific_type')}
        />
      </div>

      {!isEdit && (
        <div className="col-span-12 space-y-1">
          <Label htmlFor="initial_balance">Balance Inicial</Label>
          <MoneyInput
            id="initial_balance"
            name="initial_balance"
            value={parseFloat(initialBalance || '0') || 0}
            onValueChange={(val) => setValue('initial_balance', val?.toString() || '0')}
            disabled={isLoading}
          />
        </div>
      )}
    </>
  );
}
