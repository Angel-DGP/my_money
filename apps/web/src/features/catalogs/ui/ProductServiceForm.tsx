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
import { useCategoriesQuery } from '@entities/category';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  description: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductServiceFormProps {
  initialData?: Partial<ProductFormData> | null;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isView?: boolean;
}

export function ProductServiceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isView,
}: ProductServiceFormProps) {
  const { data: categories = [] } = useCategoriesQuery();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      category_id: initialData?.category_id || '',
      description: initialData?.description || '',
    },
  });

  const category_id = watch('category_id');

  return (
    <form
      id="productserviceform-form"
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card>
        <div className="p-6 border-b border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <Icon name="shopping-bag" size="sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Información del Comercio / Producto
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Detalles sobre el comercio o servicio recurrente.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name" required>
              Nombre del Comercio / Producto
            </Label>
            <Input
              id="prod-name"
              placeholder="Ej: Supermaxi, Amazon, Apple, Uber..."
              disabled={isView || isLoading}
              error={errors.name?.message}
              required
              {...register('name')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-cat" required>
              Categoría Principal
            </Label>
            <Select
              id="prod-cat"
              name="category_id"
              label=""
              value={category_id || ''}
              onValueChange={(val) =>
                setValue('category_id', val, { shouldValidate: true })
              }
              error={errors.category_id?.message}
              searchable
              disabled={isView || isLoading}
              required
              placeholder="Seleccionar categoría..."
            >
              {categories
                .filter((c) => c.type === 'EXPENSE')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-desc">Descripción (Opcional)</Label>
            <Input
              id="prod-desc"
              placeholder="Categoría general o notas"
              disabled={isView || isLoading}
              error={errors.description?.message}
              {...register('description')}
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
              {initialData ? 'Actualizar Comercio' : 'Guardar Comercio'}
            </Button>
          )}
        </PageContainer.Footer>
      </Card>
    </form>
  );
}
