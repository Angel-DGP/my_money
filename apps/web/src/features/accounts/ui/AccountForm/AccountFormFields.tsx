import { Input, Label, Select, MoneyInput, Icon } from '@mymoney/ui';
import { useInstitutions } from '../../../catalogs/api/useCatalogs';
import type { AccountFormFieldsProps } from './AccountForm.types';

const ACCOUNT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#64748b',
];

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

function ColorSwatch({ color, selected, onClick }: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Color ${color}`}
      className={`w-7 h-7 rounded-full transition-all ring-offset-2 ring-offset-background ${
        selected ? 'ring-2 ring-text-primary scale-110' : 'hover:scale-105'
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

export function AccountFormFields({ form, isEdit, isView, isLoading }: AccountFormFieldsProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const { data: institutions } = useInstitutions();

  const initialBalance = watch('initial_balance');
  const selectedColor = watch('color');

  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: DETALLES DE LA CUENTA ──────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="wallet" size="sm" className="text-primary-500" />
            Detalles de la Cuenta
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Información básica para identificar y clasificar tu cuenta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 space-y-2">
            <Label htmlFor="name" required>Nombre de la cuenta</Label>
            <Input 
              id="name" 
              placeholder="Ej: Ahorros Banreservas" 
              disabled={isView || isLoading}
              required 
              {...register('name')}
            />
            {errors.name && <p className="text-error-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select 
              id="type"
              label="Tipo General"
              disabled={isView || isEdit || isLoading}
              required
              {...register('type')}
              placeholder="Seleccionar tipo..."
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
            <div className="flex items-center justify-between">
              <Label htmlFor="institution_id">Institución (Opcional)</Label>
              <a
                href="/catalogs/institutions/new"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary-500 hover:text-primary-600 hover:underline font-medium"
              >
                + Crear Banco
              </a>
            </div>
            <Select 
              id="institution_id"
              searchable
              disabled={isView || isLoading}
              {...register('institution_id')}
              placeholder="Seleccionar institución..."
            >
              <option value="">No aplica</option>
              {institutions?.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="specific_type">Tipo Específico (Opcional)</Label>
            <Input 
              id="specific_type" 
              placeholder="Ej: Plan Jubilación..." 
              disabled={isView || isLoading}
              {...register('specific_type')}
            />
          </div>

          {/* ─── COLOR ────────────────────────────────────────────────────────── */}
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label>Color del Ícono</Label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border-subtle bg-surface-2/30">
              {ACCOUNT_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={selectedColor === color}
                  onClick={() => !isView && !isLoading && setValue('color', color, { shouldValidate: true })}
                />
              ))}
              {selectedColor && (
                <button
                  type="button"
                  onClick={() => setValue('color', '', { shouldValidate: true })}
                  className="w-7 h-7 rounded-full border-2 border-dashed border-border text-text-muted hover:text-text-secondary flex items-center justify-center text-xs"
                  aria-label="Sin color"
                  disabled={isView || isLoading}
                >
                  ✕
                </button>
              )}
            </div>
            {selectedColor && (
              <p className="text-xs text-text-muted">{selectedColor}</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: BALANCE INICIAL ────────────────────────────────────────── */}
      {!isEdit && (
        <div className="col-span-12 space-y-5">
          <div className="border-b border-border-subtle pb-3">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icon name="dollar-sign" size="sm" className="text-primary-500" />
              Balance Inicial
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Monto inicial con el que comienza esta cuenta en el sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="initial_balance" required>Balance Inicial</Label>
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
