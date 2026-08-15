import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  Button,
  Input,
  Label,
  Select,
  NumberInput,
  Icon,
  toast,
} from '@mymoney/ui';
import { useAccountsQuery, AccountSelect } from '@entities/account';
import {
  useCreateCard,
  useUpdateCard,
  useInstitutions,
  useCardBrands,
} from '../api/useCatalogs';
import { InstitutionDrawer } from './InstitutionDrawer';
import { CardBrandDrawer } from './CardBrandDrawer';
import type { CardDto } from '../../../shared/api/dto/catalogs.dto';

const cardSchema = z.object({
  institution_id: z.string().min(1, 'Selecciona una institución'),
  name: z.string().min(2, 'El alias es requerido'),
  brand_id: z.string().min(1, 'La red es requerida'),
  type: z.enum(['CREDIT', 'DEBIT', 'PREPAID'], {
    errorMap: () => ({ message: 'El tipo es requerido' }),
  }),
  last_four: z
    .string()
    .length(4, 'Deben ser exactamente 4 dígitos')
    .regex(/^\d+$/, 'Solo números'),
  base_interest_rate: z.string().optional().nullable(),
  billing_day: z.coerce.number().min(1).max(31).optional().nullable().or(z.literal('')),
  payment_day: z.coerce.number().min(1).max(31).optional().nullable().or(z.literal('')),
});

export type CardFormData = z.infer<typeof cardSchema>;

interface CardDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CardDto | null;
  isView?: boolean;
}

export function CardDrawer({
  open,
  onOpenChange,
  card,
  isView = false,
}: CardDrawerProps) {
  const { data: institutions = [] } = useInstitutions();
  const { data: brands = [] } = useCardBrands();
  const { data: accounts = [] } = useAccountsQuery();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const isEditing = !!card && !isView;

  // Inline sub-drawers
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      institution_id: '',
      brand_id: '',
      type: 'CREDIT',
      name: '',
      last_four: '',
      base_interest_rate: '',
      billing_day: '',
      payment_day: '',
    },
  });

  const typeValue = watch('type');
  const institutionIdValue = watch('institution_id');
  const brandIdValue = watch('brand_id');

  const handleAccountLink = (accId: string) => {
    setSelectedAccountId(accId);
    if (accId && accId !== 'none') {
      const acc = accounts.find((a) => a.id === accId);
      if (acc) {
        if (acc.institution_id) {
          setValue('institution_id', acc.institution_id, { shouldValidate: true });
        }
        if (acc.type === 'CREDIT') {
          setValue('type', 'CREDIT', { shouldValidate: true });
        } else if (acc.type === 'CHECKING' || acc.type === 'SAVINGS') {
          setValue('type', 'DEBIT', { shouldValidate: true });
        }
        const currentName = watch('name');
        if (!currentName || currentName.trim() === '') {
          setValue('name', `Tarjeta ${acc.name}`);
        }
      }
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedAccountId('');
      reset({
        institution_id: card?.institution_id || '',
        brand_id: card?.brand_id || '',
        type: (card?.type as 'CREDIT' | 'DEBIT' | 'PREPAID') || 'CREDIT',
        name: card?.name || '',
        last_four: card?.last_four || '',
        base_interest_rate: card?.base_interest_rate || '',
        billing_day: card?.billing_day || '',
        payment_day: card?.payment_day || '',
      });
    }
  }, [open, card, reset]);

  const onSubmit = async (data: CardFormData) => {
    try {
      const isCredit = data.type === 'CREDIT';
      const payload = {
        name: data.name.trim(),
        institution_id: data.institution_id,
        brand_id: data.brand_id,
        type: data.type,
        last_four: data.last_four,
        base_interest_rate: isCredit && data.base_interest_rate ? String(data.base_interest_rate) : null,
        billing_day: isCredit && data.billing_day ? Number(data.billing_day) : null,
        payment_day: isCredit && data.payment_day ? Number(data.payment_day) : null,
      };

      if (card?.id) {
        await updateCard.mutateAsync({ id: card.id, data: payload });
        toast({ title: 'Tarjeta actualizada', variant: 'success' });
      } else {
        await createCard.mutateAsync(payload);
        toast({ title: 'Tarjeta registrada exitosamente', variant: 'success' });
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Error',
        description: err.message || 'No se pudo guardar la tarjeta',
        variant: 'error',
      });
    }
  };

  const isPending = createCard.isPending || updateCard.isPending;

  return (
    <>
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Content size="lg">
          <Drawer.Header>
            <Drawer.Title>
              {isView
                ? 'Detalle de Tarjeta'
                : isEditing
                ? 'Editar Tarjeta'
                : 'Nueva Tarjeta'}
            </Drawer.Title>
            <Drawer.Description>
              {isView
                ? 'Consulta los datos de tu tarjeta'
                : 'Registra tus tarjetas de crédito, débito o prepago'}
            </Drawer.Description>
          </Drawer.Header>

          <form
            id="card-drawer-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <Drawer.Body className="space-y-5">
              {/* Vincular a Cuenta Bancaria */}
              {!isView && (
                <div className="space-y-1.5 p-3 rounded-xl bg-surface-2/60 border border-border-subtle">
                  <AccountSelect
                    id="card-linked-account"
                    label="Vincular a Cuenta Bancaria (Opcional)"
                    excludeCash={true}
                    allowNone={true}
                    noneLabel="Ninguna (Tarjeta no vinculada)"
                    placeholder="Seleccionar cuenta bancaria o de crédito..."
                    value={selectedAccountId}
                    onChange={handleAccountLink}
                    disabled={isPending}
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Filtra únicamente cuentas bancarias (no efectivo). Al seleccionar una cuenta, auto-completa el banco emisor y el tipo de tarjeta.
                  </p>
                </div>
              )}

              {/* Alias */}
              <div className="space-y-1.5">
                <Label htmlFor="card-name" required>
                  Alias o Nombre de la Tarjeta
                </Label>
                <Input
                  id="card-name"
                  placeholder="Ej: Visa Signature Principal, Mastercard Débito..."
                  disabled={isView || isPending}
                  error={errors.name?.message}
                  required
                  {...register('name')}
                />
              </div>

              {/* Banco */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-inst" required>
                    Institución (Banco)
                  </Label>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setShowNewInstitution(true)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <Icon name="plus" size="xs" /> Nuevo Banco
                    </button>
                  )}
                </div>
                <Select
                  id="card-inst"
                  value={institutionIdValue}
                  disabled={isView || isPending}
                  onValueChange={(val) =>
                    setValue('institution_id', val, { shouldValidate: true })
                  }
                  error={errors.institution_id?.message}
                  searchable
                  placeholder="Seleccionar banco..."
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Red / Marca */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-brand" required>
                    Red o Franquicia
                  </Label>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setShowNewBrand(true)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <Icon name="plus" size="xs" /> Nueva Red
                    </button>
                  )}
                </div>
                <Select
                  id="card-brand"
                  value={brandIdValue}
                  disabled={isView || isPending}
                  onValueChange={(val) =>
                    setValue('brand_id', val, { shouldValidate: true })
                  }
                  error={errors.brand_id?.message}
                  searchable
                  placeholder="Seleccionar franquicia..."
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Tipo y Últimos 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="card-type" required>
                    Tipo de Tarjeta
                  </Label>
                  <Select
                    id="card-type"
                    value={typeValue}
                    disabled={isView || isPending}
                    onValueChange={(val) =>
                      setValue('type', val as 'CREDIT' | 'DEBIT' | 'PREPAID', {
                        shouldValidate: true,
                      })
                    }
                    error={errors.type?.message}
                  >
                    <option value="CREDIT">Crédito</option>
                    <option value="DEBIT">Débito</option>
                    <option value="PREPAID">Prepago</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="card-last4" required>
                    Últimos 4 Dígitos
                  </Label>
                  <Input
                    id="card-last4"
                    placeholder="Ej: 1234"
                    maxLength={4}
                    disabled={isView || isPending}
                    error={errors.last_four?.message}
                    required
                    {...register('last_four')}
                  />
                </div>
              </div>

              {/* Parámetros Crédito */}
              {typeValue === 'CREDIT' && (
                <div className="p-4 rounded-xl bg-surface-2/40 border border-border-subtle space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="calendar" size="xs" className="text-primary-500" />
                    Ciclo de Facturación y Pago
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <NumberInput
                        id="billing-day"
                        label="Día de Corte (1-31)"
                        min={1}
                        max={31}
                        placeholder="Ej: 15"
                        disabled={isView || isPending}
                        error={errors.billing_day?.message}
                        value={watch('billing_day') ? Number(watch('billing_day')) : undefined}
                        onChange={(val) => setValue('billing_day', (val ?? '') as unknown as number, { shouldValidate: true })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <NumberInput
                        id="payment-day"
                        label="Día de Pago (1-31)"
                        min={1}
                        max={31}
                        placeholder="Ej: 5"
                        disabled={isView || isPending}
                        error={errors.payment_day?.message}
                        value={watch('payment_day') ? Number(watch('payment_day')) : undefined}
                        onChange={(val) => setValue('payment_day', (val ?? '') as unknown as number, { shouldValidate: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <NumberInput
                      id="interest-rate"
                      label="Tasa de Interés Anual (Opcional)"
                      placeholder="Ej: 16.5"
                      step={0.1}
                      min={0}
                      max={100}
                      suffix="%"
                      disabled={isView || isPending}
                      error={errors.base_interest_rate?.message}
                      value={watch('base_interest_rate') ? Number(watch('base_interest_rate')) : undefined}
                      onChange={(val) => setValue('base_interest_rate', val !== undefined ? String(val) : '', { shouldValidate: true })}
                    />
                  </div>
                </div>
              )}
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
                  form="card-drawer-form"
                  variant="primary"
                  loading={isPending}
                >
                  <Icon name="check" size="xs" className="mr-1.5" />
                  {isEditing ? 'Actualizar Tarjeta' : 'Guardar Tarjeta'}
                </Button>
              )}
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>

      {/* Sub-Drawers */}
      <InstitutionDrawer
        open={showNewInstitution}
        onOpenChange={setShowNewInstitution}
      />
      <CardBrandDrawer
        open={showNewBrand}
        onOpenChange={setShowNewBrand}
      />
    </>
  );
}
