import React, { useState } from 'react';
import { Button, Input, Label, Select, FormLayout, PageContainer } from '@mymoney/ui';
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryType } from '@entities/category';

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CategoryForm({ initialData, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<CategoryType>(initialData?.type || 'EXPENSE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      onSubmit({
        name,
        type,
      });
    } else {
      onSubmit({
        name,
        type,
        color: '#8B5CF6',
        icon: 'tag',
      });
    }
  };

  return (
    <FormLayout onSubmit={handleSubmit}>
      <div className="col-span-12 space-y-1">
        <Label htmlFor="name">Nombre de la categoría</Label>
        <Input 
          id="name" 
          name="name"
          placeholder="Ej: Alimentación" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          minLength={2}
          maxLength={50}
          required 
        />
      </div>

      <div className="col-span-12 space-y-1">
        <Select 
          id="type"
          name="type"
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          disabled={!!initialData}
        >
          <option value="EXPENSE">Gasto</option>
          <option value="INCOME">Ingreso</option>
        </Select>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={!!isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!!isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar Categoría' : 'Crear Categoría'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
