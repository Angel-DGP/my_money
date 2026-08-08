import { Button, FormLayout, PageContainer } from '@mymoney/ui';
import { useGoalForm } from './hooks/useGoalForm';
import { GoalFormFields } from './GoalFormFields';
import type { GoalFormProps } from './GoalForm.types';

export function GoalForm({ onSubmit: onSubmitCallback, onCancel, isLoading }: GoalFormProps) {
  const { form, onSubmit } = useGoalForm(onSubmitCallback);

  return (
    <FormLayout id="goalform-form" onSubmit={onSubmit}>
      <GoalFormFields form={form} isLoading={isLoading} />

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} form="goalform-form">
          {isLoading ? 'Guardando...' : 'Crear'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
