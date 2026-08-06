import React, { useState } from 'react';
import { useCardTypes, useCreateCardType } from '../api/useCatalogs';
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, Icon } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, CreditCard } from 'lucide-react';

export function CardTypesList() {
  const { data: types, isLoading, isError, error, refetch } = useCardTypes();
  const createType = useCreateCardType();
  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const handleCreate = async () => {
    if (!newTypeName.trim()) return;
    try {
      await createType.mutateAsync({ name: newTypeName });
      setIsCreating(false);
      setNewTypeName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Tipos de Tarjeta</h3>
          <p className="text-sm text-text-secondary">Gestiona los tipos de tarjetas disponibles (Ej. Crédito, Débito).</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="p-4 flex flex-col gap-4 bg-surface-2 border-brand-200 dark:border-brand-900/30">
          <h4 className="font-medium text-sm text-text-primary">Crear Nuevo Tipo</h4>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                placeholder="Nombre del tipo (ej. Prepago)" 
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                autoFocus
              />
            </div>
            <Button variant="ghost" onClick={() => setIsCreating(false)} disabled={createType.isPending}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createType.isPending || !newTypeName.trim()}>Guardar</Button>
          </div>
        </Card>
      )}

      <QueryState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <Card padding="none" className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Tarjeta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-32 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-8 h-8 text-text-tertiary" />
                      <p>No hay tipos configurados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                types?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
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
