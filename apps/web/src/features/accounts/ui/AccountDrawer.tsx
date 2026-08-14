import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from './AccountForm/AccountForm.schema';
import type { AccountFormData } from './AccountForm/AccountForm.types';
import { useCreateAccount, useUpdateAccount, type Account } from '@entities/account';
import { Drawer, Button, Input, Label, Select, MoneyInput, Icon, toast, Dialog } from '@mymoney/ui';
import { useInstitutions, useCreateInstitution } from '../../catalogs/api/useCatalogs';

interface AccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  isView?: boolean;
}

const ACCOUNT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#64748b',
];

export function AccountDrawer({ open, onOpenChange, account, isView = false }: AccountDrawerProps) {
  const isEdit = !!account;
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const { data: institutions, refetch: refetchInstitutions } = useInstitutions();
  const createInstitution = useCreateInstitution();

  const [createBankModalOpen, setCreateBankModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankType, setNewBankType] = useState('BANK');

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'CHECKING',
      initial_balance: '0',
      color: '#3b82f6',
      institution_id: '',
      specific_type: '',
    },
  });

  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = form;
  const initialBalance = watch('initial_balance');
  const selectedColor = watch('color');
  const selectedType = watch('type');

  useEffect(() => {
    if (account) {
      reset({
        name: account.name || '',
        type: (account.type as AccountFormData['type']) || 'CHECKING',
        initial_balance: account.current_balance?.value || '0',
        color: account.color || '#3b82f6',
        institution_id: account.institution_id || '',
        specific_type: account.specific_type || '',
      });
    } else {
      reset({
        name: '',
        type: 'CHECKING',
        initial_balance: '0',
        color: '#3b82f6',
        institution_id: '',
        specific_type: '',
      });
    }
  }, [account, reset, open]);

  const isLoading = createAccount.isPending || updateAccount.isPending;

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (isEdit && account) {
        await updateAccount.mutateAsync({
          id: account.id,
          data: {
            name: data.name,
            color: data.color || undefined,
            type: data.type,
            institution_id: data.institution_id || undefined,
            specific_type: data.specific_type || undefined,
          },
        });
        toast({ title: 'Cuenta actualizada', description: 'Los cambios han sido guardados.', variant: 'success' });
      } else {
        await createAccount.mutateAsync({
          name: data.name,
          type: data.type,
          initial_balance: data.initial_balance || '0',
          color: data.color || undefined,
          currency: 'USD',
          institution_id: data.institution_id || undefined,
          specific_type: data.specific_type || undefined,
        });
        toast({ title: 'Cuenta creada', description: 'Tu cuenta ha sido creada exitosamente.', variant: 'success' });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving account', error);
      toast({ title: 'Error', description: 'No se pudo guardar la cuenta.', variant: 'error' });
    }
  };

  const handleQuickCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;
    try {
      const res = await createInstitution.mutateAsync({
        name: newBankName.trim(),
        type: newBankType,
      });
      await refetchInstitutions();
      setValue('institution_id', res.id, { shouldValidate: true });
      setNewBankName('');
      setCreateBankModalOpen(false);
      toast({ title: 'Banco creado', description: 'Institución creada y asignada.', variant: 'success' });
    } catch (err) {
      console.error('Error creating bank', err);
      toast({ title: 'Error', description: 'No se pudo crear el banco.', variant: 'error' });
    }
  };

  return (
    <>
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Content size="lg">
          <Drawer.Header>
            <Drawer.Title>
              {isView ? 'Detalles de la Cuenta' : isEdit ? 'Editar Cuenta' : 'Nueva Cuenta'}
            </Drawer.Title>
            <Drawer.Description>
              {isView
                ? 'Información general y balance de tu cuenta.'
                : 'Configura los datos y saldo inicial de tu cuenta.'}
            </Drawer.Description>
          </Drawer.Header>

          <form id="account-drawer-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <Drawer.Body className="space-y-6">
              {/* Selector de Tipo en Segmented Control */}
              <div className="space-y-2">
                <Label required>Tipo de Cuenta</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { type: 'CHECKING' as const, label: 'Corriente', icon: 'credit-card' as const },
                    { type: 'SAVINGS' as const, label: 'Ahorros', icon: 'piggy-bank' as const },
                    { type: 'CASH' as const, label: 'Efectivo', icon: 'wallet' as const },
                    { type: 'CREDIT' as const, label: 'Crédito', icon: 'credit-card' as const },
                    { type: 'INVESTMENT' as const, label: 'Inversión', icon: 'trending-up' as const },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      disabled={isView || isEdit}
                      onClick={() => setValue('type', item.type, { shouldValidate: true })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        selectedType === item.type
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 font-semibold shadow-sm'
                          : 'border-border-subtle bg-surface hover:bg-surface-2 text-text-secondary'
                      } ${isEdit || isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <Icon name={item.icon} size="sm" className="mb-1" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de la cuenta */}
              <div className="space-y-2">
                <Label htmlFor="drawer-acc-name" required>Nombre de la Cuenta</Label>
                <Input
                  id="drawer-acc-name"
                  placeholder="Ej: Ahorros Banreservas, Mi Billetera..."
                  disabled={isView || isLoading}
                  error={errors.name?.message}
                  required
                  {...register('name')}
                />
              </div>

              {/* Balance inicial (solo creación) */}
              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="drawer-acc-balance" required>Balance Inicial</Label>
                  <MoneyInput
                    id="drawer-acc-balance"
                    name="initial_balance"
                    value={parseFloat(initialBalance || '0') || 0}
                    onValueChange={(val) => setValue('initial_balance', val?.toString() || '0')}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-text-muted">El saldo inicial con el que comienzas.</p>
                </div>
              )}

              {/* Institución / Banco */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="drawer-acc-inst">Institución / Banco (Opcional)</Label>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setCreateBankModalOpen(true)}
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <Icon name="plus" size="xs" /> Crear Banco
                    </button>
                  )}
                </div>
                <Select
                  id="drawer-acc-inst"
                  disabled={isView || isLoading}
                  {...register('institution_id')}
                >
                  <option value="">No aplica / Sin institución</option>
                  {institutions?.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </Select>
              </div>

              {/* Tipo específico */}
              <div className="space-y-2">
                <Label htmlFor="drawer-acc-specific">Tipo Específico (Opcional)</Label>
                <Input
                  id="drawer-acc-specific"
                  placeholder="Ej: Nómina, Fondo de Emergencia..."
                  disabled={isView || isLoading}
                  {...register('specific_type')}
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Color de Identificación</Label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border-subtle bg-surface-2/30">
                  {ACCOUNT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => !isView && !isLoading && setValue('color', color, { shouldValidate: true })}
                      className={`w-7 h-7 rounded-full transition-all ring-offset-2 ring-offset-background ${
                        selectedColor === color ? 'ring-2 ring-primary-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </Drawer.Body>

            <Drawer.Footer>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {isView ? 'Cerrar' : 'Cancelar'}
              </Button>
              {!isView && (
                <Button type="submit" disabled={isLoading} form="account-drawer-form">
                  {isLoading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Cuenta'}
                </Button>
              )}
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>

      {/* Modal Liviano para Crear Banco Inline sin perder contexto */}
      <Dialog.Root open={createBankModalOpen} onOpenChange={setCreateBankModalOpen}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={() => setCreateBankModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md bg-surface rounded-2xl border border-border-subtle p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-bold text-text-primary">
                  Crear Nueva Institución
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setCreateBankModalOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded-md"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              <form onSubmit={handleQuickCreateBank} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-bank-name" required>Nombre de la Institución</Label>
                  <Input
                    id="modal-bank-name"
                    placeholder="Ej: Banco Santander, Chase..."
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-bank-type">Tipo de Institución</Label>
                  <Select
                    id="modal-bank-type"
                    value={newBankType}
                    onChange={(e) => setNewBankType(e.target.value)}
                  >
                    <option value="BANK">Banco Tradicional</option>
                    <option value="COOPERATIVE">Cooperativa</option>
                    <option value="FINTECH">Fintech / Billetera Digital</option>
                    <option value="OTHER">Otro</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border-subtle">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCreateBankModalOpen(false)}
                    disabled={createInstitution.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createInstitution.isPending || !newBankName.trim()}
                  >
                    {createInstitution.isPending ? 'Guardando...' : 'Crear y Asignar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
