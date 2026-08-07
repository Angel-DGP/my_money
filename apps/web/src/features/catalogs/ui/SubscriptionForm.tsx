import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, FormLayout, PageContainer } from '@mymoney/ui';
import { useCards } from '../api/useCatalogs';

const subscriptionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  category_id: z.string().min(1, 'Selecciona una categoría (usa cualquier id por ahora)'), // we'll use a hardcoded category for now or let the backend fail
  card_id: z.string().optional(),
  amount: z.string().min(1, 'El monto es requerido'),
  currency: z.enum(['USD', 'EUR']),
  billing_cycle: z.enum(['MONTHLY', 'YEARLY', 'WEEKLY']),
  next_billing_date: z.string().min(1, 'La fecha es requerida'),
  url: z.string().optional(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'PAUSED']),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SubscriptionForm({ onSubmit, onCancel, isLoading }: SubscriptionFormProps) {
  const { data: cards } = useCards();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: { currency: 'USD', billing_cycle: 'MONTHLY', status: 'ACTIVE' },
  });

  const currency = watch('currency');
  const billing_cycle = watch('billing_cycle');
  const status = watch('status');
  const card_id = watch('card_id');

  return (
      <FormLayout onSubmit={handleSubmit(onSubmit)}>
        
        <div className="col-span-12">
          <Input
          label="Servicio"
          placeholder="Ej: Netflix, Spotify..."
          error={errors.name?.message}
          {...register('name')}
          />
        </div>

        {/* Temporary Category Field since we don't have categories lookup here yet */}
        <div className="col-span-12">
          <Input
          label="ID de Categoría (Temporal)"
          placeholder="id-de-categoria..."
          error={errors.category_id?.message}
          {...register('category_id')}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <Select
            label="Moneda"
            value={currency}
            onValueChange={(val) => setValue('currency', val as 'USD' | 'EUR')}
            options={[
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
            ]}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <Select
            label="Ciclo de Facturación"
            value={billing_cycle}
            onValueChange={(val) => setValue('billing_cycle', val as 'MONTHLY' | 'YEARLY' | 'WEEKLY')}
            options={[
              { label: 'Semanal', value: 'WEEKLY' },
              { label: 'Mensual', value: 'MONTHLY' },
              { label: 'Anual', value: 'YEARLY' },
            ]}
          />
        </div>
        
        <div className="col-span-12 md:col-span-6">
          <Input
            label="Próximo Cobro"
            type="date"
            error={errors.next_billing_date?.message}
            {...register('next_billing_date')}
          />
        </div>

        <div className="col-span-12">
          <Select
          label="Tarjeta Asociada (Opcional)"
          value={card_id || ''}
          onValueChange={(val) => setValue('card_id', val as string)}
          options={[
            { label: 'Ninguna', value: '' },
            ...(cards?.map(c => ({ label: `${c.name} (*${c.last_four})`, value: c.id })) || [])
          ]}
          />
        </div>

        <div className="col-span-12">
          <Input
          label="Enlace (Opcional)"
          type="url"
          placeholder="https://netflix.com/cancel"
          {...register('url')}
          />
        </div>

        <div className="col-span-12">
          <Select
          label="Estado"
          value={status}
          onValueChange={(val) => setValue('status', val as 'ACTIVE' | 'CANCELLED' | 'PAUSED')}
          options={[
            { label: 'Activa', value: 'ACTIVE' },
            { label: 'Pausada', value: 'PAUSED' },
            { label: 'Cancelada', value: 'CANCELLED' },
          ]}
          />
        </div>

        <PageContainer.Footer className="col-span-12">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Suscripción'}
          </Button>
        </PageContainer.Footer>
      </FormLayout>
  );
}
