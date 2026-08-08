import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, PageContainer, Icon, Label, FormLayout } from '@mymoney/ui';
import type { CardTypeDto } from '../../../shared/api/dto/catalogs.dto';

const cardTypeSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
});

type CardTypeFormData = z.infer<typeof cardTypeSchema>;

interface CardTypeFormProps {
  onSubmit: (data: CardTypeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: CardTypeDto | null;
}

export function CardTypeForm({ onSubmit, onCancel, isLoading, initialData }: CardTypeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CardTypeFormData>({
    resolver: zodResolver(cardTypeSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  return (
    <FormLayout id="cardtype-form" onSubmit={handleSubmit(onSubmit)} gap="lg">
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="tag" size="sm" className="text-brand-500" />
            Detalles del Tipo
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Define el tipo de tarjeta (ej. Crédito, Débito, Prepagada).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name" required>Nombre del Tipo</Label>
            <Input
              id="name"
              placeholder="Ej: Crédito, Débito..."
              disabled={isLoading}
              error={errors.name?.message}
              required
              {...register('name')}
            />
          </div>
        </div>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} leftIcon={isLoading ? 'loader-2' : undefined} form="cardtype-form">
          {isLoading ? 'Guardando...' : 'Guardar Tipo'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
