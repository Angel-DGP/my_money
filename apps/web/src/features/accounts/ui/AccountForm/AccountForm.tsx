import { Button, FormLayout, PageContainer } from '@mymoney/ui';
import { useAccountForm } from './hooks/useAccountForm';
import { AccountFormFields } from './AccountFormFields';
import type { AccountFormProps } from './AccountForm.types';

export function AccountForm({ initialData, isView, onSubmit: onSubmitCallback, onCancel, isLoading }: AccountFormProps) {
  const { form, isEdit, onSubmit } = useAccountForm(initialData, onSubmitCallback);

  return (
    <FormLayout id="accountform-form" onSubmit={onSubmit}>
      <AccountFormFields form={form} isEdit={isEdit} isView={isView} isLoading={isLoading} />

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {isView ? 'Volver' : 'Cancelar'}
        </Button>
        {!isView && (
          <Button type="submit" disabled={isLoading} form="accountform-form">
            {isLoading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Cuenta'}
          </Button>
        )}
      </PageContainer.Footer>
    </FormLayout>
  );
}
