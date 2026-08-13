import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  Button,
  Input,
  Label,
  Icon,
  toast,
} from '@mymoney/ui';
import { useCreateCardBrand, useUpdateCardBrand } from '../api/useCatalogs';
import type { CardBrandDto } from '../../../shared/api/dto/catalogs.dto';

const cardBrandSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
});

export type CardBrandFormData = z.infer<typeof cardBrandSchema>;

interface CardBrandDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: CardBrandDto | null;
  isView?: boolean;
}

export function CardBrandDrawer({
  open,
  onOpenChange,
  brand,
  isView = false,
}: CardBrandDrawerProps) {
  const createBrand = useCreateCardBrand();
  const updateBrand = useUpdateCardBrand();
  const isEditing = !!brand && !isView;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CardBrandFormData>({
    resolver: zodResolver(cardBrandSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: brand?.name || '',
      });
    }
  }, [open, brand, reset]);

  const onSubmit = async (data: CardBrandFormData) => {
    try {
      if (brand?.id) {
        await updateBrand.mutateAsync({ id: brand.id, data });
        toast({ title: 'Marca actualizada', variant: 'success' });
      } else {
        await createBrand.mutateAsync(data);
        toast({ title: 'Marca creada exitosamente', variant: 'success' });
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Error',
        description: err.message || 'No se pudo guardar la marca',
        variant: 'error',
      });
    }
  };

  const isPending = createBrand.isPending || updateBrand.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content size="md">
        <Drawer.Header>
          <Drawer.Title>
            {isView
              ? 'Detalle de Red / Marca'
              : isEditing
              ? 'Editar Red / Marca'
              : 'Nueva Red / Marca'}
          </Drawer.Title>
          <Drawer.Description>
            {isView
              ? 'Información de la red de tarjeta'
              : 'Franquicias como Visa, Mastercard, Diners, etc.'}
          </Drawer.Description>
        </Drawer.Header>

        <form
          id="card-brand-drawer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <Drawer.Body className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name" required>
                Nombre de la Red o Franquicia
              </Label>
              <Input
                id="brand-name"
                placeholder="Ej: Visa, Mastercard, American Express, Diners Club..."
                disabled={isView || isPending}
                error={errors.name?.message}
                required
                {...register('name')}
              />
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
                form="card-brand-drawer-form"
                variant="primary"
                loading={isPending}
              >
                <Icon name="check" size="xs" className="mr-1.5" />
                {isEditing ? 'Actualizar Marca' : 'Guardar Marca'}
              </Button>
            )}
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  );
}
