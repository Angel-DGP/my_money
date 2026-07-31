import React, { useState } from 'react';
import { useAccountsQuery, useCreateAccount, useUpdateAccount, useDeleteAccount } from '../../entities/account/model';
import { AccountsTable } from '../../features/accounts/ui/AccountsTable';
import { AccountForm } from '../../features/accounts/ui/AccountForm';
import type { Account, CreateAccountDto, UpdateAccountDto } from '../../entities/account/types/account.types';
import { Dialog, Button, Icon, toast } from '@mymoney/ui';
import { QueryState } from '../../shared/ui/QueryState';

export function AccountsListWidget() {
  const accountsQuery = useAccountsQuery();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleCreate = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleDelete = (account: Account) => {
    if (window.confirm(`¿Estás seguro de eliminar la cuenta ${account.name}?`)) {
      deleteAccount.mutate(account.id, {
        onSuccess: () => {
          toast({
            title: 'Cuenta eliminada',
            description: 'La cuenta ha sido eliminada.',
            variant: 'success',
          });
        },
        onError: () => {
          toast({
            title: 'Error al eliminar',
            description: 'No se pudo eliminar la cuenta.',
            variant: 'error',
          });
        }
      });
    }
  };

  const handleSubmit = (data: CreateAccountDto | UpdateAccountDto) => {
    if (editingAccount) {
      updateAccount.mutate({ id: editingAccount.id, data: data as UpdateAccountDto }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({
            title: 'Cuenta actualizada',
            description: 'Los cambios se han guardado exitosamente.',
            variant: 'success',
          });
        },
        onError: () => {
          toast({
            title: 'Error al actualizar',
            description: 'No se pudieron guardar los cambios.',
            variant: 'error',
          });
        }
      });
    } else {
      createAccount.mutate(data as CreateAccountDto, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({
            title: 'Cuenta creada',
            description: 'La cuenta se ha creado exitosamente.',
            variant: 'success',
          });
        },
        onError: () => {
          toast({
            title: 'Error al crear',
            description: 'No se pudo crear la cuenta.',
            variant: 'error',
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-base">Mis Cuentas</h2>
          <p className="text-sm text-text-muted mt-1">Gestiona tus cuentas bancarias, tarjetas y efectivo.</p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="plus" size="sm" className="mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      <QueryState 
        data={accountsQuery.data}
        isLoading={accountsQuery.isLoading}
        isError={accountsQuery.isError}
        error={accountsQuery.error}
        emptyTitle="No hay cuentas"
        emptyDescription="Comienza creando tu primera cuenta."
        emptyIcon="inbox"
      >
        {(accounts) => (
          <AccountsTable 
            accounts={accounts}
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </QueryState>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsDialogOpen(false)} />
            <div className="relative z-50 grid w-full max-w-lg gap-4 rounded-xl border border-border-subtle bg-bg-base p-6 shadow-lg sm:rounded-2xl">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-text-muted">
                  {editingAccount ? 'Modifica los datos de tu cuenta.' : 'Agrega una nueva cuenta para gestionar tu dinero.'}
                </Dialog.Description>
              </div>
              <div className="mt-4">
                <AccountForm 
                  initialData={editingAccount || undefined} 
                  onSubmit={handleSubmit} 
                  onCancel={() => setIsDialogOpen(false)}
                  isLoading={createAccount.isPending || updateAccount.isPending}
                />
              </div>
              <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <Icon name="x" size="sm" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
