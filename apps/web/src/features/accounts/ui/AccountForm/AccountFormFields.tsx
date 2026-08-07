import { Input, Label, Select, MoneyInput, Icon } from '@mymoney/ui';
import { useInstitutions } from '../../../catalogs/api/useCatalogs';
import type { AccountFormFieldsProps } from './AccountForm.types';

export function AccountFormFields({ form, isEdit, isLoading }: AccountFormFieldsProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const { data: institutions } = useInstitutions();

  const initialBalance = watch('initial_balance');

  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: DETALLES DE LA CUENTA ──────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="wallet" size="sm" className="text-brand-500" />
            Detalles de la Cuenta
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Información básica para identificar y clasificar tu cuenta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 space-y-2">
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

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select 
              id="type"
              label="Tipo General"
              disabled={isEdit || isLoading}
              required
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

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select 
              id="institution_id"
              label="Institución (Opcional)"
              searchable
              disabled={isLoading}
              {...register('institution_id')}
            >
              <option value="">Ninguna...</option>
              {institutions?.map((i: any) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="specific_type">Tipo Específico (Opcional)</Label>
            <Input 
              id="specific_type" 
              placeholder="Ej: Plan Jubilación..." 
              disabled={isLoading}
              {...register('specific_type')}
            />
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: BALANCE INICIAL ────────────────────────────────────────── */}
      {!isEdit && (
        <div className="col-span-12 space-y-5">
          <div className="border-b border-border-subtle pb-3">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icon name="dollar-sign" size="sm" className="text-brand-500" />
              Balance Inicial
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Monto inicial con el que comienza esta cuenta en el sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="initial_balance">Balance Inicial</Label>
              <MoneyInput
                id="initial_balance"
                name="initial_balance"
                value={parseFloat(initialBalance || '0') || 0}
                onValueChange={(val) => setValue('initial_balance', val?.toString() || '0')}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
