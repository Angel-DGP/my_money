import { useNavigate } from 'react-router-dom';
import { useAccountsQuery, useDeleteAccount } from '@entities/account';
import type { Account } from '@entities/account';
import { AccountsTable } from '@features/accounts';
import { Button, Icon, toast, PageContainer, AlertDialog } from '@mymoney/ui';
import { useState } from 'react';
import { QueryState } from '@shared/ui/QueryState';

export function AccountsListWidget() {
  const navigate = useNavigate();
  const accountsQuery = useAccountsQuery();
  const deleteAccount = useDeleteAccount();
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const handleView = (account: Account) => {
    navigate(`/accounts/${account.id}/edit`, { state: { isView: true } });
  };

  const handleEdit = (account: Account) => {
    navigate(`/accounts/${account.id}/edit`);
  };

  const handleDelete = (account: Account) => {
    setAccountToDelete(account);
  };  return (
    <PageContainer className="max-w-7xl">
      <PageContainer.Header
        title="Mis Cuentas"
        description="Gestiona tus cuentas bancarias, tarjetas y efectivo."
        actions={
          <Button onClick={() => navigate('/accounts/new')}>
            <Icon name="plus" size="sm" className="mr-2" />
            Nueva Cuenta
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">

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
            onView={handleView}
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </QueryState>


      </PageContainer.Body>

      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
        title="Eliminar Cuenta"
        description={`¿Estás seguro de que deseas eliminar la cuenta "${accountToDelete?.name}"? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Sí, eliminar"
        isLoading={deleteAccount.isPending}
        onConfirm={() => {
          if (accountToDelete) {
            deleteAccount.mutate(accountToDelete.id, {
              onSuccess: () => {
                setAccountToDelete(null);
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
        }}
      />
    </PageContainer>
  );
}
