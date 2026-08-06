import React, { useState } from 'react';
import { useCardBrands, useCreateCardBrand } from '../api/useCatalogs';
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, Icon } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, Tag } from 'lucide-react';

export function CardBrandsList() {
  const { data: brands, isLoading, isError, error, refetch } = useCardBrands();
  const createBrand = useCreateCardBrand();
  const [isCreating, setIsCreating] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const handleCreate = async () => {
    if (!newBrandName.trim()) return;
    try {
      await createBrand.mutateAsync({ name: newBrandName });
      setIsCreating(false);
      setNewBrandName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Redes / Marcas</h3>
          <p className="text-sm text-text-secondary">Gestiona las redes disponibles para tus tarjetas (Ej. Visa, Mastercard).</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Marca
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="p-4 flex flex-col gap-4 bg-surface-2 border-brand-200 dark:border-brand-900/30">
          <h4 className="font-medium text-sm text-text-primary">Crear Nueva Marca</h4>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                placeholder="Nombre de la marca (ej. Discover)" 
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                autoFocus
              />
            </div>
            <Button variant="ghost" onClick={() => setIsCreating(false)} disabled={createBrand.isPending}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createBrand.isPending || !newBrandName.trim()}>Guardar</Button>
          </div>
        </Card>
      )}

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <Card padding="none" className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de Marca</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-32 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="w-8 h-8 text-text-tertiary" />
                      <p>No hay marcas configuradas.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brands?.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20" size="icon" aria-label="Eliminar"><Icon name="trash-2" size="sm" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </QueryState>
    </div>
  );
}
