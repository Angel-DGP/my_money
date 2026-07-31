import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Icon, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@mymoney/ui';
import type { Category } from '../../../entities/category/types/category.types';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead align="right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color || '#E5E7EB' }}
                >
                  <Icon name={(category.icon as any) || 'tag'} size="sm" className="text-white mix-blend-difference" />
                </div>
                <div>
                  <span className="font-medium text-text-base">{category.name}</span>
                  {category.is_system && (
                    <span className="ml-2 text-xs text-text-muted bg-bg-muted px-2 py-0.5 rounded-full">Sistema</span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-text-muted">{category.type}</span>
            </TableCell>
            <TableCell align="right">
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Opciones">
                    <Icon name="more-horizontal" size="sm" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu align="end">
                  <DropdownItem onClick={() => onEdit(category)} disabled={category.is_system}>
                    <Icon name="pencil" size="sm" className="mr-2" />
                    Editar
                  </DropdownItem>
                  <DropdownItem 
                    variant="danger" 
                    onClick={() => onDelete(category)}
                    disabled={category.is_system}
                  >
                    <Icon name="trash-2" size="sm" className="mr-2" />
                    Eliminar
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
