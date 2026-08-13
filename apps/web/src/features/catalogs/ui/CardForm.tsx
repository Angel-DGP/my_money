import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Select,
  PageContainer,
  Icon,
  Label,
  Card,
} from '@mymoney/ui';
import { useInstitutions, useCardBrands } from '../api/useCatalogs';
import type { CardDto } from '../../../shared/api/dto/catalogs.dto';

const cardSchema = z.object({
  institution_id: z.string().min(1, 'Selecciona una institución'),
  name: z.string().min(2, 'El alias es requerido'),
  brand_id: z.string().min(1, 'La red es requerida'),
  type: z.enum(['CREDIT', 'DEBIT', 'PREPAID'], {
    errorMap: () => ({ message: 'El tipo es requerido' }),
  }),
  last_four: z
    .string()
    .length(4, 'Deben ser exactamente 4 dígitos')
    .regex(/^\d+$/, 'Solo números'),
  base_interest_rate: z.string().optional(),
  billing_day: z.coerce.number().min(1).max(31).optional().or(z.literal('')),
  payment_day: z.coerce.number().min(1).max(31).optional().or(z.literal('')),
});

export type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  onSubmit: (data: CardFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: CardDto | null;
  isView?: boolean;
}

export function CardForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isView,
}: CardFormProps) {
  const { data: institutions = [] } = useInstitutions();
  const { data: brands = [] } = useCardBrands();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      institution_id: initialData?.institution_id || '',
      brand_id: initialData?.brand_id || '',
      type: (initialData?.type as 'CREDIT' | 'DEBIT' | 'PREPAID') || 'CREDIT',
      name: initialData?.name || '',
      last_four: initialData?.last_four || '',
      base_interest_rate: initialData?.base_interest_rate || '',
      billing_day: initialData?.billing_day || '',
      payment_day: initialData?.payment_day || '',
    },
  });

  const type = watch('type');
  const institution_id = watch('institution_id');
  const brand_id = watch('brand_id');

  return (
    <form
      id="cardform-form"
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card>
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <Icon name="credit-card" size="sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Información de la Tarjeta
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Registra banco, red, tipo y parámetros de tu tarjeta.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Alias */}
            <div className="space-y-1.5">
              <Label htmlFor="name" required>
                Alias de la Tarjeta
              </Label>
              <Input
                id="name"
                placeholder="Ej: Tarjeta Principal, Mi Visa..."
                disabled={isView || isLoading}
                error={errors.name?.message}
                required
                {...register('name')}
              />
            </div>

            {/* Banco */}
            <div className="space-y-1.5">
              <Label htmlFor="institution_id" required>
                Institución (Banco)
              </Label>
              <Select
                id="institution_id"
                name="institution_id"
                value={institution_id || ''}
                onValueChange={(val) =>
                  setValue('institution_id', val, { shouldValidate: true })
                }
                error={errors.institution_id?.message}
                searchable
                disabled={isView || isLoading}
                required
                placeholder="Seleccionar institución"
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Red / Marca */}
            <div className="space-y-1.5">
              <Label htmlFor="brand_id" required>
                Red (Marca)
              </Label>
              <Select
                id="brand_id"
                name="brand_id"
                value={brand_id || ''}
                onValueChange={(val) =>
                  setValue('brand_id', val, { shouldValidate: true })
                }
                error={errors.brand_id?.message}
                searchable
                disabled={isView || isLoading}
                required
                placeholder="Seleccionar red"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label htmlFor="type" required>
                Tipo de Tarjeta
              </Label>
              <Select
                id="type"
                name="type"
                value={type}
                onValueChange={(val) =>
                  setValue('type', val as 'CREDIT' | 'DEBIT' | 'PREPAID', {
                    shouldValidate: true,
                  })
                }
                error={errors.type?.message}
                disabled={isView || isLoading}
                required
              >
                <option value="CREDIT">Crédito</option>
                <option value="DEBIT">Débito</option>
                <option value="PREPAID">Prepago</option>
              </Select>
            </div>

            {/* Últimos 4 dígitos */}
            <div className="space-y-1.5">
              <Label htmlFor="last_four" required>
                Últimos 4 Dígitos
              </Label>
              <Input
                id="last_four"
                placeholder="Ej: 1234"
                maxLength={4}
                disabled={isView || isLoading}
                error={errors.last_four?.message}
                required
                {...register('last_four')}
              />
            </div>
          </div>

          {/* Parámetros de Crédito */}
          {type === 'CREDIT' && (
            <div className="p-4 rounded-xl bg-surface-2/40 border border-border-subtle space-y-4 animate-in fade-in duration-200">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="calendar" size="xs" className="text-primary-500" />
                Ciclo de Facturación y Pago
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="billing_day">Día de Corte (1-31)</Label>
                  <Input
                    id="billing_day"
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ej: 15"
                    disabled={isView || isLoading}
                    error={errors.billing_day?.message}
                    {...register('billing_day')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payment_day">Día de Pago (1-31)</Label>
                  <Input
                    id="payment_day"
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ej: 5"
                    disabled={isView || isLoading}
                    error={errors.payment_day?.message}
                    {...register('payment_day')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="base_interest_rate">Tasa de Interés Anual</Label>
                  <Input
                    id="base_interest_rate"
                    placeholder="Ej: 16.5%"
                    disabled={isView || isLoading}
                    error={errors.base_interest_rate?.message}
                    {...register('base_interest_rate')}
                  />
                </div>
              </div>
            </div>
          )}
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
              {initialData ? 'Actualizar Tarjeta' : 'Guardar Tarjeta'}
            </Button>
          )}
        </PageContainer.Footer>
      </Card>
    </form>
  );
}
