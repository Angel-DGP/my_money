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
import type { InstitutionDto } from '../../../shared/api/dto/catalogs.dto';

const institutionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  type: z.enum(['BANK', 'WALLET', 'COOP', 'OTHER']),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionFormProps {
  onSubmit: (data: InstitutionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: InstitutionDto | null;
  isView?: boolean;
}

export function InstitutionForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isView,
}: InstitutionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: (initialData?.type as InstitutionFormData['type']) || 'BANK',
    },
  });

  const type = watch('type');

  return (
    <form
      id="institutionform-form"
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card>
        <div className="p-6 border-b border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <Icon name="building" size="sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Detalles de la Institución
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Información principal del banco o billetera digital.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Nombre de la Institución
            </Label>
            <Input
              id="name"
              placeholder="Ej: Banco Pichincha, Deuna, Produbanco..."
              disabled={isView || isLoading}
              error={errors.name?.message}
              required
              {...register('name')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type" required>
              Tipo de Entidad
            </Label>
            <Select
              id="type"
              label=""
              value={type}
              disabled={isView || isLoading}
              onValueChange={(val) =>
                setValue('type', val as 'BANK' | 'WALLET' | 'COOP' | 'OTHER', {
                  shouldValidate: true,
                })
              }
              error={errors.type?.message}
              required
            >
              <option value="BANK">Banco</option>
              <option value="WALLET">Billetera Digital</option>
              <option value="COOP">Cooperativa</option>
              <option value="OTHER">Otro</option>
            </Select>
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
              {initialData ? 'Actualizar Institución' : 'Guardar Institución'}
            </Button>
          )}
        </PageContainer.Footer>
      </Card>
    </form>
  );
}
