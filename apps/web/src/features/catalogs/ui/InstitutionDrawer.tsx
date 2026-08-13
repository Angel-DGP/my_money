import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  Button,
  Input,
  Label,
  Select,
  Icon,
  toast,
} from '@mymoney/ui';
import { useCreateInstitution, useUpdateInstitution } from '../api/useCatalogs';
import type { InstitutionDto } from '../../../shared/api/dto/catalogs.dto';

const institutionSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  type: z.enum(['BANK', 'WALLET', 'COOP', 'OTHER']),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institution?: InstitutionDto | null;
  isView?: boolean;
}

export function InstitutionDrawer({
  open,
  onOpenChange,
  institution,
  isView = false,
}: InstitutionDrawerProps) {
  const createInstitution = useCreateInstitution();
  const updateInstitution = useUpdateInstitution();
  const isEditing = !!institution && !isView;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: '',
      type: 'BANK',
    },
  });

  const typeValue = watch('type');

  useEffect(() => {
    if (open) {
      reset({
        name: institution?.name || '',
        type: (institution?.type as InstitutionFormData['type']) || 'BANK',
      });
    }
  }, [open, institution, reset]);

  const onSubmit = async (data: InstitutionFormData) => {
    try {
      if (institution?.id) {
        await updateInstitution.mutateAsync({ id: institution.id, data });
        toast({ title: 'Institución actualizada', variant: 'success' });
      } else {
        await createInstitution.mutateAsync(data);
        toast({ title: 'Institución creada exitosamente', variant: 'success' });
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Error',
        description: err.message || 'No se pudo guardar la institución',
        variant: 'error',
      });
    }
  };

  const isPending = createInstitution.isPending || updateInstitution.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content size="md">
        <Drawer.Header>
          <Drawer.Title>
            {isView
              ? 'Detalle de Institución'
              : isEditing
              ? 'Editar Institución'
              : 'Nueva Institución'}
          </Drawer.Title>
          <Drawer.Description>
            {isView
              ? 'Consulta los datos del banco o billetera'
              : 'Administra tus bancos y entidades financieras'}
          </Drawer.Description>
        </Drawer.Header>

        <form
          id="institution-drawer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <Drawer.Body className="space-y-5">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="inst-name" required>
                Nombre de la Institución
              </Label>
              <Input
                id="inst-name"
                placeholder="Ej: Banco Pichincha, Deuna, Produbanco..."
                disabled={isView || isPending}
                error={errors.name?.message}
                required
                {...register('name')}
              />
            </div>

            {/* Tipo de Entidad */}
            <div className="space-y-1.5">
              <Label htmlFor="inst-type" required>
                Tipo de Entidad
              </Label>
              <Select
                id="inst-type"
                value={typeValue}
                disabled={isView || isPending}
                onValueChange={(val) =>
                  setValue('type', val as 'BANK' | 'WALLET' | 'COOP' | 'OTHER', {
                    shouldValidate: true,
                  })
                }
                error={errors.type?.message}
              >
                <option value="BANK">Banco</option>
                <option value="WALLET">Billetera Digital</option>
                <option value="COOP">Cooperativa</option>
                <option value="OTHER">Otro</option>
              </Select>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {isView ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!isView && (
              <Button
                type="submit"
                form="institution-drawer-form"
                variant="primary"
                loading={isPending}
              >
                <Icon name="check" size="xs" className="mr-1.5" />
                {isEditing ? 'Actualizar Institución' : 'Guardar Institución'}
              </Button>
            )}
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  );
}
