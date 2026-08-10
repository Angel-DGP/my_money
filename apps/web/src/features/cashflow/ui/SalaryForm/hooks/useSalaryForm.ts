import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { salarySchema, type SalaryFormData } from "../SalaryForm.schema";
import { useRegisterSalary } from "../../../api/useCashflow";
import { useToast } from "@mymoney/ui";

export function useSalaryForm() {
  const navigate = useNavigate();
  const registerSalary = useRegisterSalary();
  const { toast } = useToast();

  const form = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      amount: "" as unknown as number,
      description: "Sueldo",
      startDate: new Date().toISOString().split("T")[0] as string,
      months: 12,
    },
  });

  const onSubmit = async (data: SalaryFormData) => {
    try {
      await registerSalary.mutateAsync({
        amount: data.amount,
        description: data.description,
        startDate: data.startDate,
        months: data.months,
        accountId: data.accountId,
      });
      toast({
        title: "Sueldo registrado",
        description: `Se proyectaron ${data.months} meses de sueldo correctamente.`,
        variant: "success",
      });
      navigate("/projections");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el sueldo.",
        variant: "error",
      });
    }
  };

  return {
    form,
    isPending: registerSalary.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    navigate,
  };
}
