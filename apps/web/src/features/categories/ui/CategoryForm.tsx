import React, { useState } from 'react';
import { Button, Input, Label, Select, FormLayout, PageContainer, ColorPicker, Icon, IconPicker } from '@mymoney/ui';
import type { IconName } from '@mymoney/ui';
import { useCategoriesQuery } from '@entities/category';
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryType } from '@entities/category';

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CategoryForm({ initialData, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const { data: categories = [] } = useCategoriesQuery();
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<CategoryType>(initialData?.type || 'EXPENSE');
  const [parentId, setParentId] = useState<string>(initialData?.parent_id || (initialData ? 'none' : ''));
  const [color, setColor] = useState(initialData?.color || '#8B5CF6');
  const [icon, setIcon] = useState<IconName>((initialData?.icon as IconName) || 'tag');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      onSubmit({
        name,
        color,
        icon,
        parent_id: parentId === 'none' ? null : parentId,
      } as UpdateCategoryDto);
    } else {
      onSubmit({
        name,
        type,
        color,
        icon,
        ...(parentId && parentId !== 'none' ? { parent_id: parentId } : {}),
      } as CreateCategoryDto);
    }
  };

  return (
    <FormLayout id="category-form" onSubmit={handleSubmit}>
      <div className="col-span-12 space-y-1">
        <Label htmlFor="name" required>Nombre de la categoría</Label>
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

      <div className="col-span-12 md:col-span-6 space-y-1">
        <Select 
          id="type"
          name="type"
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          disabled={!!initialData}
          required
        >
          <option value="EXPENSE">Gasto</option>
          <option value="INCOME">Ingreso</option>
        </Select>
      </div>

      <div className="col-span-12 md:col-span-6 space-y-1">
        <Select 
          id="parent_id"
          name="parent_id"
          label="Categoría Padre"
          value={parentId}
          onChange={(e) => {
            const val = e.target.value;
            setParentId(val);
            if (val && val !== 'none') {
              const parent = categories.find(c => c.id === val);
              if (parent) setType(parent.type);
            }
          }}
          disabled={!!initialData && initialData.subcategories && initialData.subcategories.length > 0} // Can't have a parent if it already has children
          placeholder="Seleccionar categoría..."
        >
          <option value="none">Ninguna</option>
          {categories
            .filter(c => c.id !== initialData?.id && !c.parent_id && (parentId && parentId !== 'none' ? true : c.type === type))
            .map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type === 'INCOME' ? 'Ingreso' : 'Gasto'})</option>
            ))}
        </Select>
      </div>

      <div className="col-span-12 space-y-1">
        <ColorPicker 
          id="color" 
          value={color} 
          onChange={setColor} 
          label="Color de la categoría" 
        />
      </div>

      <div className="col-span-12 space-y-3 pt-2">
        <div>
          <Label htmlFor="icon">Icono</Label>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-colors" style={{ backgroundColor: color }}>
              <Icon name={icon} />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-text-primary capitalize leading-none">{icon.replace(/-/g, ' ')}</span>
              <span className="text-xs text-text-secondary mt-1">Icono seleccionado</span>
            </div>
          </div>
        </div>
        <div className="w-full">
          <IconPicker value={icon} onChange={setIcon} />
        </div>
      </div>

      <PageContainer.Footer className="col-span-12">
        <Button type="button" variant="outline" onClick={onCancel} disabled={!!isLoading}>
          Cancelar
        </Button>
        <Button type="submit" form="category-form" disabled={!!isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar Categoría' : 'Crear Categoría'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
