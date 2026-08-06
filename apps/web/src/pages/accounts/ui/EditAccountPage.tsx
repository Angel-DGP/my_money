import { useNavigate, useParams } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { QueryState } from '@shared/ui/QueryState';
import { AccountForm } from '@features/accounts';
import { useUpdateAccount, useAccountDetailQuery as useAccountQuery } from '@entities/account';
import type { UpdateAccountDto, Account } from '@entities/account';

export function EditAccountPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateAccount = useUpdateAccount();
  const accountQuery = useAccountQuery(id || '');

  const handleSubmit = (data: UpdateAccountDto) => {
    if (!id) return;
    updateAccount.mutate({ id, data }, {
      onSuccess: () => {
        toast({
          title: 'Cuenta actualizada',
          description: 'Los cambios se han guardado exitosamente.',
          variant: 'success',
        });
        navigate('/accounts');
      },
      onError: () => {
        toast({
          title: 'Error al actualizar',
          description: 'No se pudieron guardar los cambios. Intenta de nuevo.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Editar Cuenta"
        description="Modifica los datos de tu cuenta."
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <QueryState 
          data={accountQuery.data}
          isLoading={accountQuery.isLoading}
          isError={accountQuery.isError}
          error={accountQuery.error}
        >
          {(account: Account) => (
            <AccountForm
              initialData={account}
              onSubmit={handleSubmit as any}
              onCancel={() => navigate('/accounts')}
              isLoading={updateAccount.isPending}
            />
          )}
        </QueryState>
      </PageContainer.Body>
    </PageContainer>
  );
}
