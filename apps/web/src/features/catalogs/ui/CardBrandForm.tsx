import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  PageContainer,
  Icon,
  Label,
  FormLayout,
} from "@mymoney/ui";
import type { CardBrandDto } from "../../../shared/api/dto/catalogs.dto";

const cardBrandSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
});

export type CardBrandFormData = z.infer<typeof cardBrandSchema>;

interface CardBrandFormProps {
  onSubmit: (data: CardBrandFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: CardBrandDto | null;
  isView?: boolean;
}

export function CardBrandForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isView,
}: CardBrandFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardBrandFormData>({
    resolver: zodResolver(cardBrandSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  return (
    <FormLayout id="cardbrand-form" onSubmit={handleSubmit(onSubmit)} gap="lg">
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="tag" size="sm" className="text-brand-500" />
            Detalles de la Marca
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Define la red o marca de la tarjeta (ej. Visa, Mastercard, American
            Express).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name" required>
              Nombre de la Marca
            </Label>
            <Input
              id="name"
              placeholder="Ej: Visa, Mastercard..."
              disabled={isView || isLoading}
              error={errors.name?.message}
              required
              {...register("name")}
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
            form="cardbrand-form"
          >
            {isLoading
              ? "Guardando..."
              : initialData
                ? "Actualizar Marca"
                : "Guardar Marca"}
          </Button>
        )}
      </PageContainer.Footer>
    </FormLayout>
  );
}
