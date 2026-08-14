import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Button,
  Input,
  Label,
  Select,
  ColorPicker,
  IconPicker,
  Icon,
  Badge,
  toast,
  AlertDialog,
  type IconName,
} from '@mymoney/ui';
import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type CategoryType,
} from '@entities/category';

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null | undefined;
  isView?: boolean | undefined;
}

export function CategoryDrawer({
  open,
  onOpenChange,
  category,
  isView: initialViewMode = false,
}: CategoryDrawerProps) {
  const isEdit = !!category;
  const [isView, setIsView] = useState(initialViewMode);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: categories = [] } = useCategoriesQuery();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [parentId, setParentId] = useState<string>('none');
  const [color, setColor] = useState('#8b5cf6');
  const [icon, setIcon] = useState<IconName>('tag');

  useEffect(() => {
    setIsView(initialViewMode);
  }, [initialViewMode, open]);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setType(category.type || 'EXPENSE');
      setParentId(category.parent_id || 'none');
      setColor(category.color || '#8b5cf6');
      setIcon((category.icon as IconName) || 'tag');
    } else {
      setName('');
      setType('EXPENSE');
      setParentId('none');
      setColor('#8b5cf6');
      setIcon('tag');
    }
  }, [category, open]);

  const isPending = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Ingresa un nombre para la categoría.',
        variant: 'warning',
      });
      return;
    }

    try {
      if (isEdit && category) {
        const payload: UpdateCategoryDto = {
          name: name.trim(),
          color,
          icon,
          parent_id: parentId && parentId !== 'none' ? parentId : null,
        };

        await updateCategory.mutateAsync({ id: category.id, data: payload });
        toast({
          title: 'Categoría actualizada',
          description: `La categoría "${name}" se actualizó correctamente.`,
          variant: 'success',
        });
      } else {
        const payload: CreateCategoryDto = {
          name: name.trim(),
          type,
          color,
          icon,
          ...(parentId && parentId !== 'none' ? { parent_id: parentId } : {}),
        };

        await createCategory.mutateAsync(payload);
        toast({
          title: 'Categoría creada',
          description: `La categoría "${name}" se creó con éxito.`,
          variant: 'success',
        });
      }

      onOpenChange(false);
    } catch {
      // Error handling is managed by the error interceptor
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    if (category.is_system) {
      toast({
        title: 'Acción no permitida',
        description: 'No puedes eliminar una categoría del sistema.',
        variant: 'warning',
      });
      return;
    }

    try {
      await deleteCategory.mutateAsync(category.id);
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría ha sido eliminada exitosamente.',
        variant: 'success',
      });
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <>
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Content size="md">
          {/* ─── HEADER ──────────────────────────────────────────────────────── */}
          <Drawer.Header>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors"
                style={{ backgroundColor: color }}
              >
                <Icon name={icon} size="md" />
              </div>
              <div>
                <Drawer.Title>
                  {isView
                    ? 'Detalle de Categoría'
                    : isEdit
                    ? 'Editar Categoría'
                    : 'Nueva Categoría'}
                </Drawer.Title>
                <Drawer.Description>
                  {isView
                    ? 'Consulta la información de esta categoría.'
                    : 'Configura la categoría para clasificar tus ingresos y gastos.'}
                </Drawer.Description>
              </div>
            </div>
          </Drawer.Header>

          {/* ─── BODY ────────────────────────────────────────────────────────── */}
          <Drawer.Body>
            <form id="category-drawer-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Vista Previa de la Tarjeta */}
              <div className="p-4 rounded-xl bg-surface-2/60 border border-border-subtle flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <Icon name={icon} size="md" />
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary text-sm">
                      {name || 'Nombre de la categoría'}
                    </span>
                    <p className="text-xs text-text-secondary">
                      {type === 'INCOME' ? 'Categoría de Ingreso' : 'Categoría de Gasto'}
                    </p>
                  </div>
                </div>
                <Badge variant={type === 'INCOME' ? 'success' : 'neutral'} size="sm">
                  {type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                </Badge>
              </div>

              {/* Nombre de la Categoría */}
              <div className="space-y-1.5">
                <Label htmlFor="cat-name" required>
                  Nombre de la categoría
                </Label>
                <Input
                  id="cat-name"
                  placeholder="Ej: Alimentación, Transporte, Servicios..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isView || isPending}
                  required
                  maxLength={50}
                />
              </div>

              {/* Tipo y Categoría Padre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-type" required>
                    Tipo de Categoría
                  </Label>
                  <Select
                    id="cat-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as CategoryType)}
                    disabled={isView || isEdit || isPending}
                  >
                    <option value="EXPENSE">Gasto</option>
                    <option value="INCOME">Ingreso</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-parent">Categoría Padre (Opcional)</Label>
                  <Select
                    id="cat-parent"
                    value={parentId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setParentId(val);
                      if (val && val !== 'none') {
                        const parent = categories.find((c) => c.id === val);
                        if (parent) setType(parent.type);
                      }
                    }}
                    disabled={
                      isView ||
                      (isEdit &&
                        !!category?.subcategories &&
                        category.subcategories.length > 0) ||
                      isPending
                    }
                  >
                    <option value="none">Ninguna (Categoría principal)</option>
                    {categories
                      .filter(
                        (c) =>
                          c.id !== category?.id &&
                          !c.parent_id &&
                          (parentId && parentId !== 'none' ? true : c.type === type)
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type === 'INCOME' ? 'Ingreso' : 'Gasto'})
                        </option>
                      ))}
                  </Select>
                </div>
              </div>

              {/* Selector de Color */}
              {!isView && (
                <div className="space-y-2">
                  <Label>Color Distintivo</Label>
                  <ColorPicker
                    value={color}
                    onChange={setColor}
                    disabled={isView || isPending}
                  />
                </div>
              )}

              {/* Selector de Icono */}
              {!isView && (
                <div className="space-y-2">
                  <Label>Icono</Label>
                  <IconPicker
                    value={icon}
                    onChange={setIcon}
                    disabled={isView || isPending}
                  />
                </div>
              )}
            </form>
          </Drawer.Body>

          {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
          <Drawer.Footer>
            {isView ? (
              <div className="flex w-full items-center justify-between">
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
                <Button variant="primary" onClick={() => setIsView(false)}>
                  <Icon name="edit" size="xs" className="mr-1.5" />
                  Editar
                </Button>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  {isEdit && !category?.is_system && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={isPending}
                    >
                      <Icon name="trash" size="xs" className="mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  form="category-drawer-form"
                  variant="primary"
                  loading={isPending}
                >
                  <Icon name="check" size="xs" className="mr-1.5" />
                  {isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
                </Button>
              </div>
            )}
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>

      {/* ─── DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN ──────────────────────────── */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Categoría"
        description={`¿Estás seguro de que deseas eliminar la categoría "${category?.name}"? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Sí, eliminar"
        isLoading={deleteCategory.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
