import React, { useState } from 'react';
import { Button, Input, Label, Select, Checkbox, FormLayout, PageContainer } from '@mymoney/ui';
import type { BudgetDto, CreateBudgetDto } from '@entities/budget';

interface CategoryOption {
  id: string;
  name: string;
}

interface BudgetFormProps {
  initialData?: BudgetDto | null;
  categories: CategoryOption[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BudgetForm({ initialData, categories, onSubmit, onCancel, isLoading }: BudgetFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    category_id: initialData?.category_id || '',
    period: initialData?.period || 'MONTHLY',
    amount: initialData?.amount?.value || '',
    currency: initialData?.amount?.currency || 'USD',
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    alert_threshold: initialData?.alert_threshold || 80,
    soft_limit: initialData?.soft_limit?.value || '',
    hard_limit: initialData?.hard_limit?.value || '',
    carry_over: initialData?.carry_over || false,
    ignore_refunds: initialData?.ignore_refunds || false,
    ignore_transfers: initialData?.ignore_transfers ?? true,
    is_frozen: initialData?.is_frozen || false,
    notes: initialData?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number' && name === 'alert_threshold') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 80 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit: any = {
      ...formData,
      soft_limit: formData.soft_limit ? formData.soft_limit : undefined,
      hard_limit: formData.hard_limit ? formData.hard_limit : undefined,
      notes: formData.notes ? formData.notes : undefined,
    };

    if (initialData) {
      onSubmit({
        amount: dataToSubmit.amount,
        currency: dataToSubmit.currency,
        alert_threshold: dataToSubmit.alert_threshold,
        soft_limit: dataToSubmit.soft_limit,
        hard_limit: dataToSubmit.hard_limit,
        carry_over: dataToSubmit.carry_over,
        ignore_refunds: dataToSubmit.ignore_refunds,
        ignore_transfers: dataToSubmit.ignore_transfers,
        is_frozen: dataToSubmit.is_frozen,
        notes: dataToSubmit.notes,
      });
    } else {
      onSubmit(dataToSubmit as CreateBudgetDto);
    }
  };

  return (
    <FormLayout onSubmit={handleSubmit}>
      <div className="col-span-12 space-y-2">
        <Select
          id="category_id"
          name="category_id"
          label="Categoría"
          value={formData.category_id}
          onChange={handleChange}
          disabled={!!initialData || isLoading}
          required
        >
          <option value="" disabled>Seleccione una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
      </div>

      <div className="col-span-12 space-y-2">
        <Select
          id="period"
          name="period"
          label="Periodo"
          value={formData.period}
          onChange={handleChange}
          disabled={!!initialData || isLoading}
        >
          <option value="MONTHLY">Mensual</option>
          <option value="YEARLY">Anual</option>
        </Select>
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
          <Label htmlFor="amount">Límite</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            disabled={!!isLoading}
            required
            placeholder="Ej: 500.00"
          />
        </div>
        <div className="col-span-12 md:col-span-6 space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Input
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            disabled={!!isLoading}
            required
          />
        </div>

      <div className="col-span-12 space-y-2">
        <Label htmlFor="start_date">Fecha de Inicio</Label>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          disabled={!!initialData || !!isLoading}
          required
        />
      </div>

      <div className="col-span-12 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-sm flex justify-between items-center"
        >
          <span>Opciones Avanzadas</span>
          <span>{showAdvanced ? '▲' : '▼'}</span>
        </Button>
      </div>

      {showAdvanced && (
        <div className="col-span-12 space-y-4 pt-2 pb-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
          <div className="space-y-2">
            <Label htmlFor="alert_threshold">Umbral de Alerta (%)</Label>
            <Input
              id="alert_threshold"
              name="alert_threshold"
              type="number"
              min="1"
              max="100"
              value={formData.alert_threshold}
              onChange={handleChange}
              disabled={!!isLoading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soft_limit">Límite Flexible (Opcional)</Label>
              <Input
                id="soft_limit"
                name="soft_limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.soft_limit}
                onChange={handleChange}
                disabled={!!isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hard_limit">Límite Estricto (Opcional)</Label>
              <Input
                id="hard_limit"
                name="hard_limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.hard_limit}
                onChange={handleChange}
                disabled={!!isLoading}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Checkbox
              name="carry_over"
              checked={formData.carry_over}
              onChange={handleChange}
              disabled={!!isLoading}
              label="Trasladar saldo sobrante (Rollover)"
            />

            <Checkbox
              name="ignore_refunds"
              checked={formData.ignore_refunds}
              onChange={handleChange}
              disabled={!!isLoading}
              label="Ignorar reembolsos"
            />

            <Checkbox
              name="ignore_transfers"
              checked={formData.ignore_transfers}
              onChange={handleChange}
              disabled={!!isLoading}
              label="Ignorar transferencias"
            />

            {initialData && (
              <Checkbox
                name="is_frozen"
                checked={formData.is_frozen}
                onChange={handleChange}
                disabled={!!isLoading}
                label="Congelar presupuesto"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={!!isLoading}
              placeholder="Ej: Solo para gastos del hogar"
            />
          </div>
        </div>
      )}

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={!!isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!!isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
