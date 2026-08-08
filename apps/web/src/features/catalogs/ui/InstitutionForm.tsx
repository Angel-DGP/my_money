import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, PageContainer, Icon, Label, FormLayout } from '@mymoney/ui';
import type { InstitutionDto } from '../../../shared/api/dto/catalogs.dto';

const institutionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  type: z.enum(['BANK', 'WALLET', 'COOP', 'OTHER']),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionFormProps {
  onSubmit: (data: InstitutionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: InstitutionDto | null;
}

export function InstitutionForm({ onSubmit, onCancel, isLoading, initialData }: InstitutionFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: (initialData?.type as any) || 'BANK',
    },
  });

  const type = watch('type');

  return (
    <FormLayout id="institutionform-form" onSubmit={handleSubmit(onSubmit)} gap="lg">
      
      {/* ─── SECCIÓN: DETALLES DE LA INSTITUCIÓN ──────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="layout-dashboard" size="sm" className="text-brand-500" />
            Detalles de la Institución
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Información principal del banco o billetera digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name" required>Nombre de la Institución</Label>
            <Input
              id="name"
              placeholder="Ej: Banco Pichincha, Deuna..."
              disabled={isLoading}
              error={errors.name?.message}
              required
              {...register('name')}
            />
          </div>
          
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="type"
              label="Tipo de Entidad"
              value={type}
              disabled={isLoading}
              onValueChange={(val) => setValue('type', val as 'BANK' | 'WALLET' | 'COOP' | 'OTHER', { shouldValidate: true })}
              options={[
                { label: 'Banco', value: 'BANK' },
                { label: 'Billetera Digital', value: 'WALLET' },
                { label: 'Cooperativa', value: 'COOP' },
                { label: 'Otro', value: 'OTHER' },
              ]}
              error={errors.type?.message}
              required
              placeholder="Seleccionar tipo..."
            />
          </div>
        </div>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} leftIcon={isLoading ? 'loader-2' : undefined} form="institutionform-form">
          {isLoading ? 'Guardando...' : 'Guardar Institución'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
