import React, { useState } from 'react';
import { Button, Input, Label, Select, FormLayout, PageContainer, ColorPicker } from '@mymoney/ui';
import type { CreateGoalDto } from '@entities/goal';
import { useAccountsQuery } from '@entities/account';

interface GoalFormProps {
  onSubmit: (data: CreateGoalDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GoalForm({ onSubmit, onCancel, isLoading }: GoalFormProps) {
  const { data: accountsResponse } = useAccountsQuery();
  const accounts: any[] = Array.isArray(accountsResponse) ? accountsResponse : [];

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    currency: 'USD',
    target_date: '',
    description: '',
    priority: '3',
    color: '#3B82F6',
    icon: 'target',
    account_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit: any = {
      name: formData.name,
      target_amount: Number(formData.target_amount),
      currency: formData.currency,
      priority: Number(formData.priority),
      color: formData.color,
      icon: formData.icon,
    };
    
    if (formData.target_date) dataToSubmit.target_date = formData.target_date;
    if (formData.description) dataToSubmit.description = formData.description;
    if (formData.account_id) dataToSubmit.account_id = formData.account_id;
    
    onSubmit(dataToSubmit as CreateGoalDto);
  };

  return (
    <FormLayout onSubmit={handleSubmit}>
      <div className="col-span-12 space-y-2">
        <Label htmlFor="name">Nombre de la Meta</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={!!isLoading}
          required
          placeholder="Ej: Ahorro para vacaciones"
        />
      </div>

      <div className="col-span-12 space-y-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={!!isLoading}
          placeholder="Ej: Viaje a Japón en 2027"
        />
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="target_amount">Objetivo</Label>
          <Input
            id="target_amount"
            name="target_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.target_amount}
            onChange={handleChange}
            disabled={!!isLoading}
            required
            placeholder="Ej: 5000.00"
          />
        </div>
        


      <div className="col-span-12 md:col-span-6 space-y-2">
        <Select
          id="priority"
          name="priority"
          label="Prioridad"
          value={formData.priority}
          onChange={handleChange}
          disabled={!!isLoading}
        >
          <option value="1">Alta (1)</option>
          <option value="2">Media (2)</option>
          <option value="3">Baja (3)</option>
        </Select>
      </div>
      
      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="target_date">Fecha Objetivo (Opcional)</Label>
        <Input
          id="target_date"
          name="target_date"
          type="date"
          value={formData.target_date}
          onChange={handleChange}
          disabled={!!isLoading}
        />
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Select
          id="account_id"
          name="account_id"
          label="Cuenta Vinculada (Opcional)"
          value={formData.account_id}
          onChange={handleChange}
          disabled={!!isLoading}
        >
          <option value="">Ninguna</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
          ))}
        </Select>
      </div>
      
      <div className="col-span-12 space-y-2">
        <ColorPicker
          id="color"
          name="color"
          label="Color de la Meta"
          value={formData.color}
          onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
          disabled={!!isLoading}
        />
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={!!isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!!isLoading}>
          {isLoading ? 'Guardando...' : 'Crear'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
