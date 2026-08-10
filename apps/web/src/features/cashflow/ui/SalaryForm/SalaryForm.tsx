import { FormLayout, Button, PageContainer } from '@mymoney/ui';
import { useSalaryForm } from './hooks/useSalaryForm';
import { SalaryFormFields } from './SalaryFormFields';

export function SalaryForm() {
  const { form, isPending, onSubmit, navigate } = useSalaryForm();

  return (
    <FormLayout
      id="salary-form"
      onSubmit={onSubmit}
    >
      <SalaryFormFields form={form} />
      
      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="ghost" onClick={() => navigate('/projections')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} form="salary-form">
          Registrar Sueldo
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
