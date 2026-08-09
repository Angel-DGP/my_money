import { Button, FormLayout, PageContainer, AlertDialog } from '@mymoney/ui';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTransactionForm } from './hooks/useTransactionForm';
import { TransactionFormFields } from './TransactionFormFields';
import type { TransactionFormProps } from './TransactionForm.types';

export function TransactionForm({ initialData, isView }: TransactionFormProps) {
  const { form, isEdit, isPending, onSubmit, handleConfirmDelete, navigate } = useTransactionForm(initialData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <FormLayout id="transactionform-form" onSubmit={onSubmit}>
      <TransactionFormFields form={form} isEdit={isEdit} isView={!!isView} />

      <PageContainer.Footer className="col-span-12">
        {isEdit && !isView && (
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => setShowDeleteConfirm(true)} 
            disabled={isPending} 
            className="text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => navigate('/transactions')}>
          {isView ? 'Volver' : 'Cancelar'}
        </Button>
        {!isView && (
          <Button type="submit" disabled={isPending} form="transactionform-form">
            {isEdit ? 'Actualizar' : 'Guardar'}
          </Button>
        )}
      </PageContainer.Footer>

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Eliminar Transacción"
        description="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
        type="error"
        confirmText="Sí, eliminar"
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
      />
    </FormLayout>
  );
}
