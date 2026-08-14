import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  Button,
  Input,
  Label,
  Select,
  MoneyInput,
  DatePicker,
  NumberInput,
  Icon,
  toast,
} from '@mymoney/ui';
import { useCards, useCreateSubscription, useUpdateSubscription } from '../api/useCatalogs';
import { CategorySelect } from '../../categories';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';

const subscriptionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  billing_cycle: z.enum(['MONTHLY', 'YEARLY']),
  next_billing_date: z.string().min(1, 'La fecha es requerida'),
  card_id: z.string().optional().nullable(),
  duration_months: z.coerce.number().min(1, 'Indica la cantidad de meses').optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionDto | null;
  isView?: boolean;
}

export function SubscriptionDrawer({
  open,
  onOpenChange,
  subscription,
  isView = false,
}: SubscriptionDrawerProps) {
  const { data: cards = [] } = useCards();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const isEditing = !!subscription && !isView;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      amount: '' as unknown as number,
      category_id: '',
      card_id: '',
      next_billing_date: new Date().toISOString().split('T')[0] as string,
      billing_cycle: 'MONTHLY',
      duration_months: 12,
    },
  });

  const billingCycleValue = watch('billing_cycle');
  const cardIdValue = watch('card_id');
  const categoryIdValue = watch('category_id');
  const amountValue = watch('amount');

  useEffect(() => {
    if (open) {
      reset({
        name: subscription?.name || '',
        amount: subscription?.amount ? Number(subscription.amount) : ('' as unknown as number),
        category_id: subscription?.category_id || '',
        card_id: subscription?.card_id || '',
        next_billing_date: subscription?.next_billing_date
          ? new Date(subscription.next_billing_date).toISOString().split('T')[0] as string
          : (new Date().toISOString().split('T')[0] as string),
        billing_cycle: (subscription?.billing_cycle as 'MONTHLY' | 'YEARLY') || 'MONTHLY',
        duration_months: subscription?.duration_months || 12,
      });
    }
  }, [open, subscription, reset]);

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      const payload = {
        name: data.name,
        amount: Number(data.amount),
        category_id: data.category_id,
        billing_cycle: data.billing_cycle,
        next_billing_date: data.next_billing_date,
        currency: 'USD',
        card_id: data.card_id ? data.card_id : null,
        duration_months: data.duration_months ? Number(data.duration_months) : 12,
      };
      if (subscription?.id) {
        await updateSubscription.mutateAsync({ id: subscription.id, data: payload });
        toast({ title: 'Suscripción actualizada', variant: 'success' });
      } else {
        await createSubscription.mutateAsync(payload);
        toast({ title: 'Suscripción registrada exitosamente', variant: 'success' });
      }
      onOpenChange(false);
    } catch {
      // Handled by global error interceptor
    }
  };

  const isPending = createSubscription.isPending || updateSubscription.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content size="lg">
        <Drawer.Header>
          <Drawer.Title>
            {isView
              ? 'Detalle de Suscripción'
              : isEditing
              ? 'Editar Suscripción'
              : 'Nueva Suscripción'}
          </Drawer.Title>
          <Drawer.Description>
            {isView
              ? 'Consulta los datos del servicio recurrente'
              : 'Administra pagos periódicos de streaming, software y servicios'}
          </Drawer.Description>
        </Drawer.Header>

        <form
          id="subscription-drawer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <Drawer.Body className="space-y-5">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-name" required>
                Nombre del Servicio
              </Label>
              <Input
                id="sub-name"
                placeholder="Ej: Netflix, Spotify, iCloud, ChatGPT Plus..."
                disabled={isView || isPending}
                error={errors.name?.message}
                required
                {...register('name')}
              />
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <CategorySelect
                id="sub-cat"
                label="Categoría de Gasto"
                value={categoryIdValue || ''}
                disabled={isView || isPending}
                onChange={(val) =>
                  setValue('category_id', val, { shouldValidate: true })
                }
                error={errors.category_id?.message}
                filterType="EXPENSE"
                required
                placeholder="Seleccionar categoría..."
              />
            </div>

            {/* Costo / Monto */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-amount" required>
                Costo de la Suscripción
              </Label>
              <MoneyInput
                id="sub-amount"
                value={typeof amountValue === 'number' ? amountValue : (Number(amountValue) || null)}
                onValueChange={(val) =>
                  setValue('amount', typeof val === 'number' ? val : 0, {
                    shouldValidate: true,
                  })
                }
                disabled={isView || isPending}
                error={errors.amount?.message}
                currency="USD"
                placeholder="0.00"
              />
            </div>

            {/* Ciclo & Próximo Cobro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sub-cycle" required>
                  Ciclo de Facturación
                </Label>
                <Select
                  id="sub-cycle"
                  value={billingCycleValue}
                  disabled={isView || isPending}
                  onValueChange={(val) =>
                    setValue('billing_cycle', val as 'MONTHLY' | 'YEARLY', {
                      shouldValidate: true,
                    })
                  }
                  error={errors.billing_cycle?.message}
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="YEARLY">Anual</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <DatePicker
                  id="sub-date"
                  label="Próxima Fecha de Cobro"
                  disabled={isView || isPending}
                  error={errors.next_billing_date?.message}
                  required
                  value={watch('next_billing_date')}
                  onChange={(d) => setValue('next_billing_date', d, { shouldValidate: true })}
                />
              </div>
            </div>

            {/* Tarjeta Asociada */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-card">Tarjeta Asociada (Opcional)</Label>
              <Select
                id="sub-card"
                value={cardIdValue || ''}
                disabled={isView || isPending}
                onValueChange={(val) =>
                  setValue('card_id', val || undefined, { shouldValidate: true })
                }
                error={errors.card_id?.message}
                placeholder="Ninguna / En Efectivo"
              >
                <option value="">Ninguna / Débito en cuenta</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (•••• {c.last_four})
                  </option>
                ))}
              </Select>
            </div>

            {/* Meses a Proyectar */}
            <div className="space-y-1.5">
              <NumberInput
                id="sub-duration"
                label="Meses a Proyectar en Flujo de Caja"
                min={1}
                max={36}
                suffix="meses"
                disabled={isView || isPending}
                error={errors.duration_months?.message}
                value={watch('duration_months')}
                onChange={(val) => setValue('duration_months', val ?? 12, { shouldValidate: true })}
              />
              <p className="text-[11px] text-text-muted">
                Generará proyecciones automáticas en la pestaña de Planificación &gt; Flujo de Caja.
              </p>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {isView ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!isView && (
              <Button
                type="submit"
                form="subscription-drawer-form"
                variant="primary"
                loading={isPending}
              >
                <Icon name="check" size="xs" className="mr-1.5" />
                {isEditing ? 'Actualizar Suscripción' : 'Guardar Suscripción'}
              </Button>
            )}
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  );
}
