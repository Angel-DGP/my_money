import { useNavigate } from 'react-router-dom';
import { toast, PageContainer } from '@mymoney/ui';
import { AccountForm } from '@features/accounts';
import { useCreateAccount } from '@entities/account';
import type { CreateAccountDto } from '@entities/account';

export function NewAccountPage() {
  const navigate = useNavigate();
  const createAccount = useCreateAccount();

  const handleSubmit = (data: CreateAccountDto) => {
    createAccount.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Cuenta creada',
          description: 'La cuenta se ha creado exitosamente.',
          variant: 'success',
        });
        navigate('/accounts');
      },
      onError: () => {
        toast({
          title: 'Error al crear',
          description: 'No se pudo crear la cuenta. Intenta de nuevo.',
          variant: 'error',
        });
      }
    });
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Nueva Cuenta"
        description="Agrega una cuenta bancaria, efectivo o tarjeta"
        backTo={() => navigate(-1)}
      />

      <PageContainer.Body variant="transparent" className="py-6">
        <AccountForm
          onSubmit={(data) => handleSubmit(data as CreateAccountDto)}
        onCancel={() => navigate('/accounts')}
        isLoading={createAccount.isPending}
      />
      </PageContainer.Body>
    </PageContainer>
  );
}
