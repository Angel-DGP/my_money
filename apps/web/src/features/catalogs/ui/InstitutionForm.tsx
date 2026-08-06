import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, FormLayout, PageContainer } from '@mymoney/ui';

const institutionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  type: z.enum(['BANK', 'WALLET', 'COOP', 'OTHER']),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionFormProps {
  onSubmit: (data: InstitutionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InstitutionForm({ onSubmit, onCancel, isLoading }: InstitutionFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: { type: 'BANK' },
  });

  const type = watch('type');

  return (
      <FormLayout onSubmit={handleSubmit(onSubmit)}>
        <div className="col-span-12">
          <Input
          label="Nombre de la Institución"
          placeholder="Ej: Banco Pichincha, Deuna..."
          error={errors.name?.message}
          {...register('name')}
          />
        </div>
        
        <div className="col-span-12">
          <Select
          label="Tipo"
          value={type}
          onValueChange={(val) => setValue('type', val as any)}
          options={[
            { label: 'Banco', value: 'BANK' },
            { label: 'Billetera Digital', value: 'WALLET' },
            { label: 'Cooperativa', value: 'COOP' },
            { label: 'Otro', value: 'OTHER' },
          ]}
          error={errors.type?.message}
          />
        </div>

        <PageContainer.Footer className="col-span-12">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Institución'}
          </Button>
        </PageContainer.Footer>
      </FormLayout>
  );
}
