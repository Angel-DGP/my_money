import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  PageContainer,
  Icon,
  Label,
  Card,
} from '@mymoney/ui';
import type { CardBrandDto } from '../../../shared/api/dto/catalogs.dto';

const cardBrandSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
});

export type CardBrandFormData = z.infer<typeof cardBrandSchema>;

interface CardBrandFormProps {
  onSubmit: (data: CardBrandFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: CardBrandDto | null;
  isView?: boolean;
}

export function CardBrandForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isView,
}: CardBrandFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardBrandFormData>({
    resolver: zodResolver(cardBrandSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  return (
    <form
      id="cardbrand-form"
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card>
        <div className="p-6 border-b border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <Icon name="tag" size="sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Detalles de la Marca
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Define la red o franquicia de la tarjeta (ej. Visa, Mastercard, American Express).
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Nombre de la Marca
            </Label>
            <Input
              id="name"
              placeholder="Ej: Visa, Mastercard, Diners Club..."
              disabled={isView || isLoading}
              error={errors.name?.message}
              required
              {...register('name')}
            />
          </div>
        </div>

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
              {initialData ? 'Actualizar Marca' : 'Guardar Marca'}
            </Button>
          )}
        </PageContainer.Footer>
      </Card>
    </form>
  );
}
