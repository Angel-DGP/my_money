import { Button, FormLayout, PageContainer } from '@mymoney/ui';
import { useBudgetForm } from './hooks/useBudgetForm';
import { BudgetFormFields } from './BudgetFormFields';
import type { BudgetFormProps } from './BudgetForm.types';

export function BudgetForm({ initialData, categories, onSubmit: onSubmitCallback, onCancel, isLoading }: BudgetFormProps) {
  const { form, isEdit, onSubmit } = useBudgetForm(initialData, onSubmitCallback);

  return (
    <FormLayout onSubmit={onSubmit}>
      <BudgetFormFields form={form} categories={categories} isEdit={isEdit} isLoading={isLoading} />

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
