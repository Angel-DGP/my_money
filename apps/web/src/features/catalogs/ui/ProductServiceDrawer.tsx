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
import { useCreateProductService, useUpdateProductService } from '../api/useCatalogs';
import { CategorySelect } from '../../categories';
import type { ProductServiceDto } from '../../../shared/api/dto/catalogs.dto';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  description: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductServiceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductServiceDto | null;
  isView?: boolean;
}

export function ProductServiceDrawer({
  open,
  onOpenChange,
  product,
  isView = false,
}: ProductServiceDrawerProps) {
  const createProduct = useCreateProductService();
  const updateProduct = useUpdateProductService();
  const isEditing = !!product && !isView;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category_id: '',
      description: '',
    },
  });

  const categoryIdValue = watch('category_id');

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name || '',
        category_id: product?.category_id || '',
        description: '',
      });
    }
  }, [open, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product?.id) {
        await updateProduct.mutateAsync({ id: product.id, data });
        toast({ title: 'Comercio / Producto actualizado', variant: 'success' });
      } else {
        await createProduct.mutateAsync(data);
        toast({ title: 'Comercio / Producto registrado exitosamente', variant: 'success' });
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Error',
        description: err.message || 'No se pudo guardar el producto',
        variant: 'error',
      });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content size="md">
        <Drawer.Header>
          <Drawer.Title>
            {isView
              ? 'Detalle de Comercio / Producto'
              : isEditing
              ? 'Editar Comercio / Producto'
              : 'Nuevo Comercio / Producto'}
          </Drawer.Title>
          <Drawer.Description>
            {isView
              ? 'Consulta los datos del comercio frecuente'
              : 'Guarda comercios recurrentes (ej. Supermaxi, Uber, Apple)'}
          </Drawer.Description>
        </Drawer.Header>

        <form
          id="product-drawer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <Drawer.Body className="space-y-5">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-name" required>
                Nombre del Comercio / Producto
              </Label>
              <Input
                id="prod-name"
                placeholder="Ej: Supermaxi, Uber, Amazon, Apple Store..."
                disabled={isView || isPending}
                error={errors.name?.message}
                required
                {...register('name')}
              />
            </div>

            {/* Categoría Principal */}
            <div className="space-y-1.5">
              <CategorySelect
                id="prod-category"
                label="Categoría Principal (Gasto)"
                value={categoryIdValue || ''}
                disabled={isView || isPending}
                filterType="EXPENSE"
                onChange={(val) =>
                  setValue('category_id', val, { shouldValidate: true })
                }
                error={errors.category_id?.message}
                required
                placeholder="Seleccionar categoría..."
              />
            </div>

            {/* Descripción (Opcional) */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-desc">Descripción o Notas (Opcional)</Label>
              <Input
                id="prod-desc"
                placeholder="Categoría general o notas"
                disabled={isView || isPending}
                error={errors.description?.message}
                {...register('description')}
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
                form="product-drawer-form"
                variant="primary"
                loading={isPending}
              >
                <Icon name="check" size="xs" className="mr-1.5" />
                {isEditing ? 'Actualizar Comercio' : 'Guardar Comercio'}
              </Button>
            )}
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  );
}
