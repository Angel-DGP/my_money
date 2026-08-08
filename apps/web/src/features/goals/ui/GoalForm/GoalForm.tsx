import { Button, FormLayout, PageContainer } from '@mymoney/ui';
import { useGoalForm } from './hooks/useGoalForm';
import { GoalFormFields } from './GoalFormFields';
import type { GoalFormProps } from './GoalForm.types';

export function GoalForm({ initialData, isView, onSubmit: onSubmitCallback, onCancel, isLoading }: GoalFormProps) {
  const { form, isEdit, onSubmit } = useGoalForm(initialData, onSubmitCallback);

  return (
    <FormLayout id="goalform-form" onSubmit={onSubmit}>
      <GoalFormFields form={form} isView={isView} isLoading={isLoading} />

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {isView ? 'Volver' : 'Cancelar'}
        </Button>
        {!isView && (
          <Button type="submit" disabled={isLoading} form="goalform-form">
            {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        )}
      </PageContainer.Footer>
    </FormLayout>
  );
}
