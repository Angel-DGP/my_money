import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, FormLayout, PageContainer } from '@mymoney/ui';
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
    <FormLayout onSubmit={handleSubmit(onSubmit)}>
        
        <div className="col-span-12">
          <Select
          id="institution_id"
          name="institution_id"
          label="Institución (Banco)"
          value={institution_id || ''}
          onChange={(e) => setValue('institution_id', e.target.value)}
          error={errors.institution_id?.message}
          searchable
        >
          <option value="">Seleccionar...</option>
          {institutions?.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
          </Select>
        </div>

        <div className="col-span-12">
          <Input
          label="Alias de la Tarjeta"
          placeholder="Ej: Tarjeta Principal, Mi Visa..."
          error={errors.name?.message}
          {...register('name')}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <Select
            id="brand_id"
            name="brand_id"
            label="Red (Marca)"
            value={brand_id || ''}
            onChange={(e) => setValue('brand_id', e.target.value)}
            error={errors.brand_id?.message}
          >
            <option value="">Seleccionar...</option>
            {brands?.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <Input
            label="Últimos 4 dígitos"
            placeholder="1234"
            maxLength={4}
            error={errors.last_four?.message}
            {...register('last_four')}
          />
        </div>

        <div className="col-span-12">
          <Select
          id="type_id"
          name="type_id"
          label="Tipo de Tarjeta"
          value={type_id || ''}
          onChange={(e) => setValue('type_id', e.target.value)}
          error={errors.type_id?.message}
        >
          <option value="">Seleccionar...</option>
          {types?.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
          </Select>
        </div>

        <PageContainer.Footer className="col-span-12">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Tarjeta'}
          </Button>
        </PageContainer.Footer>
      </FormLayout>
  );
}
