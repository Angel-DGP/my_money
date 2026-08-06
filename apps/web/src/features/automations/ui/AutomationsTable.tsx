import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, Button, Icon, Checkbox } from '@mymoney/ui';
import type { AutoRuleDto } from '@entities/automation';
import { TriggerType, ActionType } from '@entities/automation';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';

interface AutomationsTableProps {
  rules: AutoRuleDto[];
  onEdit: (rule: AutoRuleDto) => void;
  onDelete: (rule: AutoRuleDto) => void;
  onToggleActive: (rule: AutoRuleDto, isActive: boolean) => void;
}

const triggerLabels: Record<string, string> = {
  [TriggerType.INCOME_RECEIVED]: 'Ingreso Recibido',
  [TriggerType.BUDGET_THRESHOLD]: 'Límite Presupuesto',
  [TriggerType.MONTH_END]: 'Fin de Mes',
  [TriggerType.CUSTOM]: 'Personalizado',
};

const actionLabels: Record<string, string> = {
  [ActionType.MOVE_TO_GOAL]: 'Mover a Meta',
  [ActionType.RESERVE_AMOUNT]: 'Reservar Fondos',
  [ActionType.ALERT_USER]: 'Enviar Alerta',
};

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
];

export function AutomationsTable({ rules, onEdit, onDelete, onToggleActive }: AutomationsTableProps) {
  const {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalFiltered,
    paginated,
  } = useTableState<AutoRuleDto>({
    data: rules,
    pageSize: 10,
    searchFields: ['name', 'description'],
    filterField: (r, f) => {
      if (f === 'active') return r.is_active;
      if (f === 'inactive') return !r.is_active;
      return true;
    },
    defaultSort: { column: 'name', direction: 'asc' },
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        placeholder="Buscar automatización..."
      />

      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Estado</th>
              </TableCell>
              <TableCell asChild>
                <th>
                  <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                    Nombre / Descripción
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Desencadenante</th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Acción</th>
              </TableCell>
              <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Opciones</th>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                  No se encontraron reglas de automatización
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((rule) => (
                <TableRow key={rule.id} className="hover:bg-surface-hover transition-colors">
                  <TableCell>
                    <Checkbox
                      checked={rule.is_active} 
                      onCheckedChange={(checked) => onToggleActive(rule, checked as boolean)}
                      aria-label="Activar/Desactivar regla"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary">{rule.name}</span>
                      {rule.description && (
                        <span className="text-sm text-text-secondary line-clamp-1">{rule.description}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">
                      {triggerLabels[rule.trigger_type] || rule.trigger_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary">
                      {actionLabels[rule.action_type] || rule.action_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => onEdit(rule)}>
                      <Icon name="pencil" size="sm" />
                    </Button>
                    <Button variant="secondary" size="icon" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950" aria-label="Eliminar" onClick={() => onDelete(rule)}>
                      <Icon name="trash" size="sm" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        pageSize={10}
        onPageChange={setPage}
      />
    </div>
  );
}
