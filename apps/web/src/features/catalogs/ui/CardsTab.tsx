import { useCards } from '../api/useCatalogs';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Icon, DataTable, type ColumnDef } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardBrandsList } from './CardBrandsList';
import { CardTypesList } from './CardTypesList';
import type { CardDto } from '../../../shared/api/dto/catalogs.dto';

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Crédito', value: 'CREDIT' },
  { label: 'Débito', value: 'DEBIT' },
];

export function CardsTab() {
  const { data: cards, isLoading, isError, error, refetch } = useCards();
  const navigate = useNavigate();

  const columns: ColumnDef<CardDto>[] = [
    {
      key: 'name',
      header: 'Alias',
      sortable: true,
      className: 'font-medium',
      cell: (c) => c.name,
    },
    {
      key: 'institution.name',
      header: 'Banco',
      cell: (c) => c.institution?.name,
    },
    {
      key: 'brand.name',
      header: 'Red',
      cell: (c) => c.brand?.name,
    },
    {
      key: 'last_four',
      header: 'Terminación',
      cell: (c) => `**** ${c.last_four}`,
    },
    {
      key: 'type.name',
      header: 'Tipo',
      cell: (c) => c.type?.name,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      cell: () => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Editar">
            <Icon name="pencil" size="sm" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Módulo de Tarjetas</h3>
          <p className="text-sm text-text-secondary">Registra tus tarjetas y gestiona las redes y tipos disponibles.</p>
        </div>
      </div>

      <Tabs defaultValue="cards">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="cards">Tarjetas</TabsTrigger>
          <TabsTrigger value="brands">Redes (Marcas)</TabsTrigger>
          <TabsTrigger value="types">Tipos</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="pt-2">
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate('/catalogs/cards/new')} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarjeta
            </Button>
          </div>

          <QueryState
            data={cards}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
          >
            {() => (
              <DataTable<CardDto>
                data={cards || []}
                columns={columns}
                pageSize={10}
                searchFields={['name', (c) => c.institution?.name || '', (c) => c.brand?.name || '']}
                searchPlaceholder="Buscar tarjeta, banco o red..."
                filters={FILTERS}
                filterField={(c, f) => {
                  const typeName = c.type?.name?.toLowerCase() || '';
                  if (f === 'CREDIT') return typeName.includes('crédito') || typeName.includes('credito') || typeName.includes('credit');
                  if (f === 'DEBIT') return typeName.includes('débito') || typeName.includes('debito') || typeName.includes('debit');
                  return true;
                }}
                defaultSort={{ column: 'name', direction: 'asc' }}
                emptyMessage="No se encontraron resultados."
              />
            )}
          </QueryState>
        </TabsContent>

        <TabsContent value="brands">
          <CardBrandsList />
        </TabsContent>

        <TabsContent value="types">
          <CardTypesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

