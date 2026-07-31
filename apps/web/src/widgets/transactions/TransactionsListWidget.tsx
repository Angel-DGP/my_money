import React, { useState } from 'react';
import { useTransactionsQuery, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../../entities/transaction/model';
import { useAccountsQuery } from '../../entities/account/model';
import { useCategoriesQuery } from '../../entities/category/model';
import { TransactionsList } from '../../features/transactions/ui/TransactionsList';
import { TransactionForm } from '../../features/transactions/ui/TransactionForm';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto } from '../../entities/transaction/types/transaction.types';
import { Dialog, Button, Icon, toast } from '@mymoney/ui';
import { QueryState } from '../../shared/ui/QueryState';

export function TransactionsListWidget() {
  const transactionsQuery = useTransactionsQuery();
  const accountsQuery = useAccountsQuery();
  const categoriesQuery = useCategoriesQuery();
  
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleCreate = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      deleteTransaction.mutate(transaction.id, {
        onSuccess: () => {
          toast({
            title: 'Transacción eliminada',
            description: 'La transacción ha sido eliminada.',
            variant: 'success',
          });
        },
        onError: () => {
          toast({
            title: 'Error al eliminar',
            description: 'No se pudo eliminar la transacción.',
            variant: 'error',
          });
        }
      });
    }
  };

  const handleSubmit = (data: CreateTransactionDto | UpdateTransactionDto) => {
    if (editingTransaction) {
      updateTransaction.mutate({ id: editingTransaction.id, data: data as UpdateTransactionDto }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({
            title: 'Transacción actualizada',
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
      createTransaction.mutate(data as CreateTransactionDto, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({
            title: 'Transacción creada',
            description: 'La transacción se ha registrado exitosamente.',
            variant: 'success',
          });
        },
        onError: () => {
          toast({
            title: 'Error al crear',
            description: 'No se pudo registrar la transacción.',
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
          <h2 className="text-2xl font-bold text-text-base">Transacciones</h2>
          <p className="text-sm text-text-muted mt-1">Registra tus ingresos, gastos y transferencias.</p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="plus" size="sm" className="mr-2" />
          Nueva Transacción
        </Button>
      </div>

      <QueryState 
        data={transactionsQuery.data?.data}
        isLoading={transactionsQuery.isLoading}
        isError={transactionsQuery.isError}
        error={transactionsQuery.error}
        emptyTitle="No hay transacciones"
        emptyDescription="Comienza registrando tus movimientos."
        emptyIcon="repeat"
      >
        {(transactions) => (
          <div className="bg-bg-base border border-border-subtle rounded-xl p-4">
            <TransactionsList 
              transactions={transactions}
              onTransactionClick={handleEdit} 
            />
          </div>
        )}
      </QueryState>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsDialogOpen(false)} />
            <div className="relative z-50 grid w-full max-w-md gap-4 rounded-xl border border-border-subtle bg-bg-base p-6 shadow-lg sm:rounded-2xl">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-text-muted">
                  {editingTransaction ? 'Modifica los detalles del movimiento.' : 'Registra un nuevo movimiento en tus cuentas.'}
                </Dialog.Description>
              </div>
              <div className="mt-4">
                <TransactionForm 
                  initialData={editingTransaction || undefined} 
                  accounts={accountsQuery.data || []}
                  categories={categoriesQuery.data || []}
                  onSubmit={handleSubmit} 
                  onCancel={() => setIsDialogOpen(false)}
                  isLoading={createTransaction.isPending || updateTransaction.isPending}
                />
              </div>
              {editingTransaction && (
                <div className="absolute top-4 right-14">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(editingTransaction)} className="text-error-600 hover:text-error-700 hover:bg-error-50">
                    <Icon name="trash-2" size="sm" />
                  </Button>
                </div>
              )}
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
