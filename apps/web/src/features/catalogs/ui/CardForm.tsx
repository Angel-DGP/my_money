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
import { useInstitutions, useCardBrands } from "../api/useCatalogs";
import type { CardDto } from "../../../shared/api/dto/catalogs.dto";

const cardSchema = z.object({
  institution_id: z.string().min(1, "Selecciona una institución"),
  name: z.string().min(2, "El alias es requerido"),
  brand_id: z.string().min(1, "La red es requerida"),
  type: z.enum(["CREDIT", "DEBIT", "PREPAID"], {
    errorMap: () => ({ message: "El tipo es requerido" }),
  }),
  last_four: z
    .string()
    .length(4, "Deben ser exactamente 4 dígitos")
    .regex(/^\d+$/, "Solo números"),
  base_interest_rate: z.string().optional(),
  billing_day: z.coerce.number().min(1).max(31).optional().or(z.literal("")),
  payment_day: z.coerce.number().min(1).max(31).optional().or(z.literal("")),
});

export type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  onSubmit: (data: CardFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: CardDto | null;
  isView?: boolean;
}

export function CardForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isView,
}: CardFormProps) {
  const { data: institutions } = useInstitutions();
  const { data: brands } = useCardBrands();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      institution_id: initialData?.institution_id || "",
      brand_id: initialData?.brand_id || "",
      type: (initialData?.type as "CREDIT" | "DEBIT" | "PREPAID") || "CREDIT",
      name: initialData?.name || "",
      last_four: initialData?.last_four || "",
      base_interest_rate: initialData?.base_interest_rate || "",
      billing_day: initialData?.billing_day || "",
      payment_day: initialData?.payment_day || "",
    },
  });

  const type = watch("type");
  const institution_id = watch("institution_id");
  const brand_id = watch("brand_id");

  console.log("Form Errors:", errors);
  console.log("Watched Values:", { institution_id, type, brand_id });

  return (
    <FormLayout id="cardform-form" onSubmit={handleSubmit(onSubmit)} gap="lg">
      {/* ─── SECCIÓN: ASIGNACIÓN BANCARIA ────────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon
              name="layout-dashboard"
              size="sm"
              className="text-primary-500"
            />
            Asignación Bancaria
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Indica el banco emisor y el alias para identificar la tarjeta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Select
              id="institution_id"
              name="institution_id"
              label="Institución (Banco)"
              value={institution_id || ""}
              onValueChange={(val) =>
                setValue("institution_id", val, { shouldValidate: true })
              }
              error={errors.institution_id?.message}
              searchable
              disabled={isView || isLoading}
              required
              placeholder="Seleccionar institución"
            >
              {institutions?.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="name" required>
              Alias de la Tarjeta
            </Label>
            <Input
              id="name"
              placeholder="Ej: Tarjeta Principal, Mi Visa..."
              disabled={isView || isLoading}
              error={errors.name?.message}
              required
              {...register("name")}
            />
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: DATOS DE LA TARJETA ────────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="credit-card" size="sm" className="text-primary-500" />
            Datos de la Tarjeta
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Red, tipo y terminación para clasificar los pagos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select
              id="brand_id"
              name="brand_id"
              label="Red (Marca)"
              value={brand_id || ""}
              onValueChange={(val) =>
                setValue("brand_id", val, { shouldValidate: true })
              }
              error={errors.brand_id?.message}
              disabled={isView || isLoading}
              required
              placeholder="Seleccionar marca"
            >
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Select
              id="type"
              name="type"
              label="Tipo de Tarjeta"
              value={type || ""}
              onValueChange={(val) =>
                setValue("type", val as "CREDIT" | "DEBIT" | "PREPAID", {
                  shouldValidate: true,
                })
              }
              error={errors.type?.message}
              disabled={isView || isLoading}
              required
              placeholder="Seleccionar tipo"
            >
              <option value="CREDIT">Crédito</option>
              <option value="DEBIT">Débito</option>
              <option value="PREPAID">Prepago</option>
            </Select>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="last_four" required>
              Últimos 4 dígitos
            </Label>
            <Input
              id="last_four"
              placeholder="1234"
              maxLength={4}
              disabled={isView || isLoading}
              error={errors.last_four?.message}
              required
              {...register("last_four")}
            />
          </div>
        </div>
      </div>

      {type === "CREDIT" && (
        <div className="col-span-12 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="border-b border-border-subtle pb-3">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icon name="percent" size="sm" className="text-brand-500" />
              Condiciones de Crédito
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Configura las tasas e información de corte para tus diferidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-4 space-y-2">
              <Label htmlFor="base_interest_rate">
                Tasa de Interés Base (%)
              </Label>
              <Input
                id="base_interest_rate"
                type="number"
                step="0.01"
                placeholder="16.5"
                disabled={isView || isLoading}
                error={errors.base_interest_rate?.message}
                {...register("base_interest_rate")}
              />
            </div>

            <div className="col-span-12 md:col-span-4 space-y-2">
              <Label htmlFor="billing_day">Día de Corte</Label>
              <Input
                id="billing_day"
                type="number"
                placeholder="15"
                min={1}
                max={31}
                disabled={isView || isLoading}
                error={errors.billing_day?.message}
                {...register("billing_day")}
              />
            </div>

            <div className="col-span-12 md:col-span-4 space-y-2">
              <Label htmlFor="payment_day">Día de Pago</Label>
              <Input
                id="payment_day"
                type="number"
                placeholder="5"
                min={1}
                max={31}
                disabled={isView || isLoading}
                error={errors.payment_day?.message}
                {...register("payment_day")}
              />
            </div>
          </div>
        </div>
      )}

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
            form="cardform-form"
          >
            {isLoading
              ? "Guardando..."
              : initialData
                ? "Actualizar Tarjeta"
                : "Guardar Tarjeta"}
          </Button>
        )}
      </PageContainer.Footer>
    </FormLayout>
  );
}
