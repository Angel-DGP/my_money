import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salarySchema, type SalaryFormData } from './SalaryForm/SalaryForm.schema';
import { useRegisterSalary } from '../api/useCashflow';
import { useAccountsQuery } from '@entities/account';
import {
  Drawer,
  Button,
  Input,
  Label,
  Select,
  MoneyInput,
  DatePicker,
  NumberInput,
  toast,
} from '@mymoney/ui';

interface SalaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalaryDrawer({ open, onOpenChange }: SalaryDrawerProps) {
  const registerSalary = useRegisterSalary();
  const { data: accounts = [] } = useAccountsQuery();

  const form = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      amount: '' as unknown as number,
      description: 'Sueldo',
      startDate: new Date().toISOString().split('T')[0] as string,
      months: 12,
      accountId: '',
    },
  });

  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = form;
  const amountValue = watch('amount');

  useEffect(() => {
    if (open) {
      reset({
        amount: '' as unknown as number,
        description: 'Sueldo',
        startDate: new Date().toISOString().split('T')[0] as string,
        months: 12,
        accountId: accounts[0]?.id || '',
      });
    }
  }, [open, accounts, reset]);

  const onSubmit = async (data: SalaryFormData) => {
    try {
      await registerSalary.mutateAsync({
        amount: data.amount,
        description: data.description,
        startDate: data.startDate,
        months: data.months,
        accountId: data.accountId,
      });
      toast({
        title: 'Sueldo registrado',
        description: `Se proyectaron ${data.months} meses de sueldo correctamente.`,
        variant: 'success',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error registering salary', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el sueldo.',
        variant: 'error',
      });
    }
  };

  const isPending = registerSalary.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content size="lg">
        <Drawer.Header>
          <Drawer.Title>Registrar Sueldo Recurrente</Drawer.Title>
          <Drawer.Description>
            Ingresa los detalles de tu ingreso periódico para proyectarlo automáticamente en el flujo de caja.
          </Drawer.Description>
        </Drawer.Header>

        <form id="salary-drawer-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <Drawer.Body className="space-y-6">
            {/* Monto Destacado */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-surface-2/30 border border-border-subtle text-center">
              <Label htmlFor="salary-amount" required className="text-xs uppercase tracking-wider text-text-muted">
                Monto del Sueldo (Ingreso Mensual)
              </Label>
              <div className="max-w-xs mx-auto">
                <MoneyInput
                  id="salary-amount"
                  name="amount"
                  value={parseFloat(amountValue ? amountValue.toString() : '0') || 0}
                  onValueChange={(val) => setValue('amount', val || ('' as unknown as number), { shouldValidate: true })}
                  disabled={isPending}
                />
              </div>
              {errors.amount && <p className="text-xs text-error-500 font-medium">{errors.amount.message}</p>}
            </div>

            {/* Cuenta Destino */}
            <div className="space-y-2">
              <Label htmlFor="salary-account-id" required>Cuenta Destino</Label>
              <Select
                id="salary-account-id"
                disabled={isPending}
                error={errors.accountId?.message}
                {...register('accountId')}
              >
                <option value="">Seleccionar cuenta...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </Select>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="salary-description" required>Descripción</Label>
              <Input
                id="salary-description"
                placeholder="Ej: Sueldo Principal, Nómina Quincenal..."
                disabled={isPending}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>

            {/* Fecha de Inicio y Cantidad de Meses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <DatePicker
                  id="salary-start-date"
                  label="Fecha de Inicio (Primer Pago)"
                  disabled={isPending}
                  error={errors.startDate?.message}
                  required
                  value={watch('startDate')}
                  onChange={(d) => setValue('startDate', d, { shouldValidate: true })}
                />
              </div>

              <div className="space-y-2">
                <NumberInput
                  id="salary-months"
                  label="Meses a Proyectar"
                  min={1}
                  max={36}
                  suffix="meses"
                  placeholder="12"
                  disabled={isPending}
                  error={errors.months?.message}
                  required
                  value={watch('months')}
                  onChange={(val) => setValue('months', val || 12, { shouldValidate: true })}
                />
              </div>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} form="salary-drawer-form">
              {isPending ? 'Registrando...' : 'Registrar Sueldo'}
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  );
}
