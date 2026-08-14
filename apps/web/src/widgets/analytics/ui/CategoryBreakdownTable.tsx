import { useState } from 'react';
import { Card, Icon, type IconName } from '@mymoney/ui';
import type { SpendingByCategoryDto } from '../../../entities/analytics/api/analytics.api';

export interface CategoryBreakdownTableProps {
  categories: SpendingByCategoryDto[];
  totalExpense: number;
  periodLabel?: string;
  className?: string;
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
};

export function CategoryBreakdownTable({
  categories = [],
  totalExpense = 0,
  periodLabel = 'este periodo',
  className = '',
}: CategoryBreakdownTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'count' | 'name'>('amount');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filtered = categories.filter((c) =>
    c.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'amount') diff = b.amount - a.amount;
    else if (sortBy === 'count') diff = b.transaction_count - a.transaction_count;
    else if (sortBy === 'name') diff = a.category_name.localeCompare(b.category_name);
    return sortOrder === 'desc' ? diff : -diff;
  });

  const toggleSort = (field: 'amount' | 'count' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <Card className={`p-6 flex flex-col ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Icon name="tag" size="sm" className="text-brand-500" />
            Desglose Detallado por Categoría
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Ranking y proporción del gasto en {periodLabel}
          </p>
        </div>

        {/* Search filter input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8.5 pl-8 pr-3 text-xs rounded-lg border border-border-subtle bg-background/50 backdrop-blur-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Icon
              name="search"
              size="xs"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-muted space-y-2">
          <Icon name="inbox" size="lg" className="opacity-40" />
          <p className="text-xs font-medium">
            {searchTerm ? 'No se encontraron categorías coincidentes' : 'No hay categorías registradas'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => toggleSort('name')}
                  className="pb-3 pr-4 cursor-pointer hover:text-text-primary transition-colors select-none"
                >
                  Categoría {sortBy === 'name' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </th>
                <th
                  onClick={() => toggleSort('count')}
                  className="pb-3 px-4 text-center cursor-pointer hover:text-text-primary transition-colors select-none hidden sm:table-cell"
                >
                  Movimientos {sortBy === 'count' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </th>
                <th className="pb-3 px-4 text-left w-36 hidden md:table-cell">
                  Proporción
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="pb-3 pl-4 text-right cursor-pointer hover:text-text-primary transition-colors select-none"
                >
                  Total Gastado {sortBy === 'amount' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sorted.map((item) => {
                const color = item.category_color || '#3b82f6';
                const percentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : item.percentage;
                return (
                  <tr key={item.category_id} className="hover:bg-surface-2/40 transition-colors group">
                    {/* Category info */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          <Icon name={(item.category_icon as IconName) || 'tag'} size="xs" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-text-primary block truncate">
                            {item.category_name}
                          </span>
                          <span className="text-[11px] text-text-muted sm:hidden">
                            {item.transaction_count} {item.transaction_count === 1 ? 'movimiento' : 'movimientos'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Count */}
                    <td className="py-3 px-4 text-center text-text-secondary hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 font-medium">
                        {item.transaction_count}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-text-secondary">
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(2, percentage))}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 pl-4 text-right font-bold text-text-primary">
                      {formatCurrency(item.amount, item.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
