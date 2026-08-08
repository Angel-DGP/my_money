import { Button, FormLayout, PageContainer } from '@mymoney/ui';
import { Trash2 } from 'lucide-react';
import { useTransactionForm } from './hooks/useTransactionForm';
import { TransactionFormFields } from './TransactionFormFields';
import type { TransactionFormProps } from './TransactionForm.types';

export function TransactionForm({ initialData }: TransactionFormProps) {
  const { form, isEdit, isPending, onSubmit, handleDelete, navigate } = useTransactionForm(initialData);

  return (
    <FormLayout id="transactionform-form" onSubmit={onSubmit}>
      <TransactionFormFields form={form} isEdit={isEdit} />

      <PageContainer.Footer className="col-span-12">
        {isEdit && (
          <Button 
            variant="ghost" 
            type="button" 
            onClick={handleDelete} 
            disabled={isPending} 
            className="text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => navigate('/transactions')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} form="transactionform-form">
          {isEdit ? 'Actualizar' : 'Guardar'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
