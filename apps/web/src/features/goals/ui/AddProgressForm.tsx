import React, { useState } from 'react';
import { Button, Input, Label, FormLayout } from '@mymoney/ui';
import type { AddGoalProgressDto } from '@entities/goal';

interface AddProgressFormProps {
  goalName: string;
  defaultCurrency: string;
  onSubmit: (data: AddGoalProgressDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddProgressForm({ goalName, defaultCurrency, onSubmit, onCancel, isLoading }: AddProgressFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: defaultCurrency,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(formData.amount),
      currency: formData.currency,
    });
  };

  return (
    <FormLayout id="addprogressform-form" onSubmit={handleSubmit}>
      <div className="col-span-12 text-sm text-text-secondary mb-4">
        Aportando a: <span className="font-medium text-text-primary">{goalName}</span>
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
          <Label htmlFor="amount">Monto a Aportar</Label>
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
            placeholder="Ej: 100.00"
          />
        </div>
        <div className="col-span-12 md:col-span-6 space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Input
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            disabled={true} // Usually we keep the goal's currency
            required
          />
        </div>

      <div className="flex justify-end gap-2 mt-4 col-span-12 border-t border-border-subtle pt-3">
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={!!isLoading}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={!!isLoading} form="addprogressform-form">
          {isLoading ? 'Guardando...' : 'Aportar'}
        </Button>
      </div>

    </FormLayout>
  );
}
