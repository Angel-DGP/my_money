import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, Icon, Checkbox } from '@mymoney/ui';
import type { AutoRuleDto } from '@entities/automation';
import { TriggerType, ActionType } from '@entities/automation';
import { useTableState, DataTableToolbar, SortableHeader, TablePagination } from '@mymoney/ui';

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
    filterField: (r: AutoRuleDto, f: string) => {
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
              <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider sticky right-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[-4px_0_12px_rgba(0,0,0,0.05)]">
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
              paginated.map((rule: AutoRuleDto) => (
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
                  <TableCell className="sticky right-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[-4px_0_12px_rgba(0,0,0,0.05)] group-hover:bg-surface-hover">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" aria-label="Editar" onClick={(e) => { e.stopPropagation(); onEdit(rule); }} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
                        <Icon name="edit" size="sm" />
                      </button>
                      <button type="button" aria-label="Eliminar" onClick={(e) => { e.stopPropagation(); onDelete(rule); }} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
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
