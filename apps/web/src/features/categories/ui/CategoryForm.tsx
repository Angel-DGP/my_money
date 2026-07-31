import React, { useState } from 'react';
import { Button, Input, Label } from '@mymoney/ui';
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryType } from '../../../entities/category/types/category.types';

interface CategoryFormProps {
  initialData?: Category;
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre de la categoría</Label>
        <Input 
          id="name" 
          placeholder="Ej: Alimentación" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="type">Tipo</Label>
        <select 
          id="type"
          className="w-full h-10 px-3 py-2 bg-bg-base border border-border-base rounded-md text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-text-base transition-colors"
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          disabled={!!initialData} // Usually you don't change the type of an existing category
        >
          <option value="EXPENSE">Gasto</option>
          <option value="INCOME">Ingreso</option>
          <option value="TRANSFER">Transferencia</option>
        </select>
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-border-subtle mt-6">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!name.trim() || isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  );
}
