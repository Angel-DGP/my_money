import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Select,
  PageContainer,
  Icon,
  Label,
  FormLayout,
} from "@mymoney/ui";
import { useCategoriesQuery } from "@entities/category";

const productSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  category_id: z.string().min(1, "La categoría es requerida"),
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
  const { data: categories } = useCategoriesQuery();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      category_id: initialData?.category_id || "",
      description: initialData?.description || "",
    },
  });

  const category_id = watch("category_id");

  return (
    <FormLayout
      id="productserviceform-form"
      onSubmit={handleSubmit(onSubmit)}
      className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10"
    >
      {/* ─── SECCIÓN: INFORMACIÓN DEL COMERCIO/PRODUCTO ────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="shopping-bag" size="sm" className="text-primary-500" />
            Información del Comercio / Producto
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Detalles sobre el lugar donde realizas compras o el producto
            adquirido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name" required>
              Nombre del Comercio/Producto
            </Label>
            <Input
              id="name"
              placeholder="Ej: Supermaxi, Amazon, Apple..."
              disabled={isView || isLoading}
              error={errors.name?.message}
              required
              {...register("name")}
            />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="category_id"
              name="category_id"
              label="Categoría Principal"
              value={category_id || ""}
              onValueChange={(val) =>
                setValue("category_id", val, { shouldValidate: true })
              }
              error={errors.category_id?.message}
              searchable
              disabled={isView || isLoading}
              required
              placeholder="Seleccionar categoría..."
            >
              {categories
                ?.filter((c) => c.type === "EXPENSE")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-12 space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              placeholder="Categoría general o notas"
              disabled={isView || isLoading}
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
        </div>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          {isView ? "Volver" : "Cancelar"}
        </Button>
        {!isView && (
          <Button
            type="submit"
            disabled={isLoading}
            leftIcon={isLoading ? "loader-2" : undefined}
            form="productserviceform-form"
          >
            {isLoading
              ? "Guardando..."
              : initialData
                ? "Actualizar Comercio"
                : "Guardar Comercio"}
          </Button>
        )}
      </PageContainer.Footer>
    </FormLayout>
  );
}
