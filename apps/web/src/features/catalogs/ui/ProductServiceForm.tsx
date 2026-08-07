import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, PageContainer, Icon, Label } from '@mymoney/ui';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductServiceFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductServiceForm({ onSubmit, onCancel, isLoading }: ProductServiceFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: INFORMACIÓN DEL COMERCIO/PRODUCTO ────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="shopping-bag" size="sm" className="text-primary-500" />
            Información del Comercio / Producto
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Detalles sobre el lugar donde realizas compras o el producto adquirido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name">Nombre del Comercio/Producto</Label>
            <Input
              id="name"
              placeholder="Ej: Supermaxi, Amazon, Apple..."
              disabled={isLoading}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              placeholder="Categoría general o notas"
              disabled={isLoading}
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        </div>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} leftIcon={isLoading ? 'loader-2' : undefined}>
          {isLoading ? 'Guardando...' : 'Guardar Comercio'}
        </Button>
      </PageContainer.Footer>
    </form>
  );
}
