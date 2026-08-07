import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, PageContainer, Icon, Label } from '@mymoney/ui';
import { useInstitutions, useCardBrands, useCardTypes } from '../api/useCatalogs';

const cardSchema = z.object({
  institution_id: z.string().min(1, 'Selecciona una institución'),
  name: z.string().min(2, 'El alias es requerido'),
  brand_id: z.string().min(1, 'La red es requerida'),
  type_id: z.string().min(1, 'El tipo es requerido'),
  last_four: z.string().length(4, 'Deben ser exactamente 4 dígitos').regex(/^\d+$/, 'Solo números'),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  onSubmit: (data: CardFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CardForm({ onSubmit, onCancel, isLoading }: CardFormProps) {
  const { data: institutions } = useInstitutions();
  const { data: brands } = useCardBrands();
  const { data: types } = useCardTypes();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {},
  });

  const type_id = watch('type_id');
  const institution_id = watch('institution_id');
  const brand_id = watch('brand_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: ASIGNACIÓN BANCARIA ────────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="layout-dashboard" size="sm" className="text-primary-500" />
            Asignación Bancaria
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Indica el banco emisor y el alias para identificar la tarjeta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="institution_id"
              name="institution_id"
              label="Institución (Banco)"
              value={institution_id || ''}
              onChange={(e) => setValue('institution_id', e.target.value)}
              error={errors.institution_id?.message}
              searchable
              disabled={isLoading}
            >
              <option value="">Seleccionar...</option>
              {institutions?.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name">Alias de la Tarjeta</Label>
            <Input
              id="name"
              placeholder="Ej: Tarjeta Principal, Mi Visa..."
              disabled={isLoading}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: DATOS DE LA TARJETA ────────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="credit-card" size="sm" className="text-primary-500" />
            Datos de la Tarjeta
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Red, tipo y terminación para clasificar los pagos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select
              id="brand_id"
              name="brand_id"
              label="Red (Marca)"
              value={brand_id || ''}
              onChange={(e) => setValue('brand_id', e.target.value)}
              error={errors.brand_id?.message}
              disabled={isLoading}
            >
              <option value="">Seleccionar...</option>
              {brands?.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select
              id="type_id"
              name="type_id"
              label="Tipo de Tarjeta"
              value={type_id || ''}
              onChange={(e) => setValue('type_id', e.target.value)}
              error={errors.type_id?.message}
              disabled={isLoading}
            >
              <option value="">Seleccionar...</option>
              {types?.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="last_four">Últimos 4 dígitos</Label>
            <Input
              id="last_four"
              placeholder="1234"
              maxLength={4}
              disabled={isLoading}
              error={errors.last_four?.message}
              {...register('last_four')}
            />
          </div>
        </div>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} leftIcon={isLoading ? 'loader-2' : undefined}>
          {isLoading ? 'Guardando...' : 'Guardar Tarjeta'}
        </Button>
      </PageContainer.Footer>
    </form>
  );
}
