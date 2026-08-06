import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, FormLayout, PageContainer } from '@mymoney/ui';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  category_id: z.string().min(1, 'Selecciona una categoría (usa cualquier id por ahora)'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductServiceForm({ onSubmit, onCancel, isLoading }: ProductFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  return (
      <FormLayout onSubmit={handleSubmit(onSubmit)}>
        
        <div className="col-span-12">
          <Input
          label="Nombre Comercial"
          placeholder="Ej: Supermaxi, Uber, Netflix..."
          error={errors.name?.message}
          {...register('name')}
          />
        </div>

        <div className="col-span-12">
          <Input
          label="ID de Categoría por Defecto (Temporal)"
          placeholder="id-de-categoria..."
          error={errors.category_id?.message}
          {...register('category_id')}
          />
        </div>

        <PageContainer.Footer className="col-span-12">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </PageContainer.Footer>
      </FormLayout>
  );
}
