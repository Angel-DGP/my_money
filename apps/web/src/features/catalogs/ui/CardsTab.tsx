import { useState } from 'react';
import { useCards, useDeleteCard } from '../api/useCatalogs';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Icon, DataTable, type ColumnDef, PageContainer, AlertDialog } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CardBrandsList } from './CardBrandsList';

import type { CardDto } from '../../../shared/api/dto/catalogs.dto';

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Crédito', value: 'CREDIT' },
  { label: 'Débito', value: 'DEBIT' },
];

export function CardsTab() {
  const { data: cards, isLoading, isError, error, refetch } = useCards();
  const deleteCard = useDeleteCard();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'cards');
  const [cardToDelete, setCardToDelete] = useState<CardDto | null>(null);

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
      key: 'type',
      header: 'Tipo',
      cell: (c) => c.type === 'CREDIT' ? 'Crédito' : c.type === 'DEBIT' ? 'Débito' : 'Prepago',
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (c) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/catalogs/cards/edit/${c.id}`, { state: { isView: true } }); }} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/catalogs/cards/edit/${c.id}`); }} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setCardToDelete(c); }} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageContainer.Header
        title="Módulo de Tarjetas"
        description="Registra tus tarjetas y gestiona las redes y tipos disponibles."
        actions={
          <>
            {activeTab === 'cards' && (
              <Button onClick={() => navigate('/catalogs/cards/new')} className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" /> Nueva Tarjeta
              </Button>
            )}
            {activeTab === 'brands' && (
              <Button onClick={() => navigate('/catalogs/card-brands/new')} className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" /> Nueva Marca
              </Button>
            )}

          </>
        }
      />
      <PageContainer.Body variant="transparent">
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-max mx-auto sm:mx-0 mb-4">
          <TabsTrigger value="cards">Tarjetas</TabsTrigger>
          <TabsTrigger value="brands">Redes (Marcas)</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="pt-2">
          <div className="flex sm:hidden justify-end mb-4">
            <Button onClick={() => navigate('/catalogs/cards/new')} className="w-full">
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
                  if (f === 'CREDIT') return c.type === 'CREDIT';
                  if (f === 'DEBIT') return c.type === 'DEBIT';
                  return true;
                }}
                defaultSort={{ column: 'name', direction: 'asc' }}
                onRowClick={(c) => navigate(`/catalogs/cards/edit/${c.id}`, { state: { isView: true } })}
                emptyMessage="No se encontraron resultados."
              />
            )}
          </QueryState>

          <AlertDialog
            open={!!cardToDelete}
            onOpenChange={(open) => !open && setCardToDelete(null)}
            title="¿Eliminar tarjeta?"
            description={`Estás a punto de eliminar la tarjeta "${cardToDelete?.name}". Esta acción no se puede deshacer y puede fallar si la tarjeta tiene transacciones asociadas.`}
            type="error"
            confirmText="Eliminar"
            isLoading={deleteCard.isPending}
            onConfirm={async () => {
              if (!cardToDelete) return;
              try {
                await deleteCard.mutateAsync(cardToDelete.id);
                setCardToDelete(null);
              } catch (error) {
                console.error("Error al eliminar la tarjeta", error);
              }
            }}
          />

        </TabsContent>

        <TabsContent value="brands">
          <div className="flex sm:hidden justify-end mb-4">
            <Button onClick={() => navigate('/catalogs/card-brands/new')} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Nueva Marca
            </Button>
          </div>
          <CardBrandsList />
        </TabsContent>


        </Tabs>
      </div>
      </PageContainer.Body>
    </PageContainer>
  );
}

