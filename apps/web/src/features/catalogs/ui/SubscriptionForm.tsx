import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, MoneyInput, PageContainer, Icon, Label, FormLayout } from '@mymoney/ui';
import { useCards } from '../api/useCatalogs';
import { useCategoriesQuery } from '@entities/category';

const subscriptionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  amount: z.number().min(0, 'Debe ser positivo'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  billing_cycle: z.enum(['MONTHLY', 'YEARLY']),
  next_billing_date: z.string().min(1, 'La fecha es requerida'),
  card_id: z.string().optional().nullable(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  initialData?: Partial<SubscriptionFormData>;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SubscriptionForm({ initialData, onSubmit, onCancel, isLoading }: SubscriptionFormProps) {
  const { data: cards } = useCards();
  const { data: categories } = useCategoriesQuery();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: initialData?.name || '',
      amount: initialData?.amount || 0,
      category_id: initialData?.category_id || '',
      card_id: initialData?.card_id || (initialData ? 'none' : ''),
      next_billing_date: initialData?.next_billing_date || '',
      billing_cycle: initialData?.billing_cycle || 'MONTHLY',
    },
  });

  const billing_cycle = watch('billing_cycle');
  const card_id = watch('card_id');
  const category_id = watch('category_id');
  const amount = watch('amount');

  return (
    <FormLayout id="subscriptionform-form" onSubmit={handleSubmit(onSubmit)} className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: INFORMACIÓN DE SUSCRIPCIÓN ──────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="repeat" size="sm" className="text-primary-500" />
            Información de Suscripción
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Detalles principales del servicio al que estás suscrito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name" required>Nombre del Servicio</Label>
            <Input
              id="name"
              placeholder="Ej: Netflix, Spotify, Gimnasio..."
              disabled={isLoading}
              error={errors.name?.message}
              required
              {...register('name')}
            />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="category_id"
              name="category_id"
              label="Categoría de Gasto"
              value={category_id || ''}
              onValueChange={(val) => setValue('category_id', val, { shouldValidate: true })}
              error={errors.category_id?.message}
              searchable
              disabled={isLoading}
              required
              placeholder="Seleccionar categoría..."
            >
              {categories?.filter(c => c.type === 'EXPENSE').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="amount" required>Costo de la Suscripción</Label>
            <MoneyInput
              id="amount"
              name="amount"
              value={amount || 0}
              disabled={isLoading}
              required
              onValueChange={(val) => setValue('amount', val ? Number(val) : 0, { shouldValidate: true })}
            />
            {errors.amount && <p className="text-error-500 text-xs">{errors.amount.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="billing_cycle"
              label="Ciclo de Facturación"
              value={billing_cycle}
              disabled={isLoading}
              onValueChange={(val) => setValue('billing_cycle', val as 'MONTHLY' | 'YEARLY', { shouldValidate: true })}
              options={[
                { label: 'Mensual', value: 'MONTHLY' },
                { label: 'Anual', value: 'YEARLY' },
              ]}
              error={errors.billing_cycle?.message}
              required
              placeholder="Seleccionar ciclo..."
            />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="next_billing_date" required>Próxima fecha de cobro</Label>
            <Input
              id="next_billing_date"
              type="date"
              leftIcon="calendar"
              disabled={isLoading}
              error={errors.next_billing_date?.message}
              required
              {...register('next_billing_date')}
            />
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: CONFIGURACIÓN DE PAGOS ──────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="credit-card" size="sm" className="text-primary-500" />
            Configuración de Pagos
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Indica cómo y desde dónde se paga este servicio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="card_id"
              name="card_id"
              label="Tarjeta Asociada (Opcional)"
              value={card_id || ''}
              onValueChange={(val) => setValue('card_id', val === 'none' ? '' : val, { shouldValidate: true })}
              error={errors.card_id?.message}
              disabled={isLoading}
              placeholder="Seleccionar tarjeta..."
            >
              <option value="none">No aplica / Pago manual</option>
              {cards?.map(c => (
                <option key={c.id} value={c.id}>{c.name} (*{c.last_four})</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} leftIcon={isLoading ? 'loader-2' : undefined} form="subscriptionform-form">
          {isLoading ? 'Guardando...' : 'Guardar Suscripción'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
