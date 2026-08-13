import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Select,
  MoneyInput,
  PageContainer,
  Icon,
  Label,
  Card,
} from '@mymoney/ui';
import { useCards } from '../api/useCatalogs';
import { useCategoriesQuery } from '@entities/category';

const subscriptionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  amount: z.number().min(0.01, 'Debe ser mayor a 0'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  billing_cycle: z.enum(['MONTHLY', 'YEARLY']),
  next_billing_date: z.string().min(1, 'La fecha es requerida'),
  card_id: z.string().optional().nullable(),
  duration_months: z.coerce.number().min(1, 'Indica la cantidad de meses').optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  initialData?: Partial<SubscriptionFormData>;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isView?: boolean;
}

export function SubscriptionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isView,
}: SubscriptionFormProps) {
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategoriesQuery();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: initialData?.name || '',
      amount: initialData?.amount || 0,
      category_id: initialData?.category_id || '',
      card_id: initialData?.card_id || '',
      next_billing_date: initialData?.next_billing_date || '',
      billing_cycle: initialData?.billing_cycle || 'MONTHLY',
      duration_months: initialData?.duration_months || 12,
    },
  });

  const billing_cycle = watch('billing_cycle');
  const card_id = watch('card_id');
  const category_id = watch('category_id');
  const amount = watch('amount');

  return (
    <form
      id="subscription-form"
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card>
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <Icon name="repeat" size="sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Información de la Suscripción
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Detalles principales del servicio periódico recurrente.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-name" required>
                Nombre del Servicio
              </Label>
              <Input
                id="sub-name"
                placeholder="Ej: Netflix, Spotify, Gimnasio, ChatGPT..."
                disabled={isView || isLoading}
                error={errors.name?.message}
                required
                {...register('name')}
              />
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-cat" required>
                Categoría de Gasto
              </Label>
              <Select
                id="sub-cat"
                name="category_id"
                value={category_id || ''}
                onValueChange={(val) =>
                  setValue('category_id', val, { shouldValidate: true })
                }
                error={errors.category_id?.message}
                searchable
                disabled={isView || isLoading}
                required
                placeholder="Seleccionar categoría..."
              >
                {categories
                  .filter((c) => c.type === 'EXPENSE')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </div>

            {/* Monto */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-amount" required>
                Costo de la Suscripción
              </Label>
              <MoneyInput
                id="sub-amount"
                name="amount"
                value={amount || 0}
                disabled={isView || isLoading}
                required
                onValueChange={(val) =>
                  setValue('amount', val ? Number(val) : 0, {
                    shouldValidate: true,
                  })
                }
                error={errors.amount?.message}
              />
            </div>

            {/* Ciclo */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-cycle" required>
                Ciclo de Facturación
              </Label>
              <Select
                id="sub-cycle"
                value={billing_cycle}
                disabled={isView || isLoading}
                onValueChange={(val) =>
                  setValue('billing_cycle', val as 'MONTHLY' | 'YEARLY', {
                    shouldValidate: true,
                  })
                }
                error={errors.billing_cycle?.message}
                required
              >
                <option value="MONTHLY">Mensual</option>
                <option value="YEARLY">Anual</option>
              </Select>
            </div>

            {/* Fecha de Cobro */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-date" required>
                Próxima fecha de cobro
              </Label>
              <Input
                id="sub-date"
                type="date"
                disabled={isView || isLoading}
                error={errors.next_billing_date?.message}
                required
                {...register('next_billing_date')}
              />
            </div>

            {/* Meses a proyectar */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-duration" required>
                Meses a Proyectar en Flujo de Caja
              </Label>
              <Input
                id="sub-duration"
                type="number"
                min={1}
                max={36}
                placeholder="Ej. 12"
                disabled={isView || isLoading}
                error={errors.duration_months?.message}
                required
                {...register('duration_months')}
              />
            </div>
          </div>

          {/* Tarjeta Asociada */}
          <div className="pt-4 border-t border-border-subtle space-y-3">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Icon name="credit-card" size="xs" className="text-primary-500" />
              Medio de Pago Asociado
            </h4>
            <div className="max-w-md space-y-1.5">
              <Label htmlFor="sub-card">Tarjeta Asociada (Opcional)</Label>
              <Select
                id="sub-card"
                name="card_id"
                value={card_id || ''}
                onValueChange={(val) =>
                  setValue('card_id', val || null, { shouldValidate: true })
                }
                error={errors.card_id?.message}
                disabled={isView || isLoading}
                placeholder="Seleccionar tarjeta..."
              >
                <option value="">No aplica / Pago manual</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (*{c.last_four})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <PageContainer.Footer>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {isView ? 'Volver' : 'Cancelar'}
          </Button>
          {!isView && (
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
            >
              <Icon name="check" size="xs" className="mr-1.5" />
              {initialData
                ? 'Actualizar Suscripción'
                : 'Guardar Suscripción'}
            </Button>
          )}
        </PageContainer.Footer>
      </Card>
    </form>
  );
}
