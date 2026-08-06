import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountsQuery, useUpdateAccount, useDeleteAccount } from '@entities/account';
import type { Account, UpdateAccountDto } from '@entities/account';
import { AccountsTable } from '@features/accounts';
import { AccountForm } from '@features/accounts';
import { Button, Icon, toast, PageContainer } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';

export function AccountsListWidget() {
  const navigate = useNavigate();
  const accountsQuery = useAccountsQuery();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const handleEdit = (account: Account) => {
    navigate(`/accounts/${account.id}/edit`);
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



  return (
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
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </QueryState>


      </PageContainer.Body>
    </PageContainer>
  );
}
