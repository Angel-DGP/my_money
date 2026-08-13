import { useState, useRef } from 'react';
import { useCards, useDeleteCard } from '../api/useCatalogs';
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Icon,
  DataTable,
  type ColumnDef,
  PageContainer,
  AlertDialog,
} from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { useSearchParams } from 'react-router-dom';
import { CardBrandsList, type CardBrandsListRef } from './CardBrandsList';
import { CardDrawer } from './CardDrawer';
import type { CardDto } from '../../../shared/api/dto/catalogs.dto';

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Crédito', value: 'CREDIT' },
  { label: 'Débito', value: 'DEBIT' },
  { label: 'Prepago', value: 'PREPAID' },
];

export function CardsTab() {
  const { data: cards, isLoading, isError, error, refetch } = useCards();
  const deleteCard = useDeleteCard();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'cards');

  // Drawers state
  const [cardDrawerOpen, setCardDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardDto | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardDto | null>(null);

  const brandsListRef = useRef<CardBrandsListRef>(null);

  const handleOpenCreateCard = () => {
    setSelectedCard(null);
    setIsViewMode(false);
    setCardDrawerOpen(true);
  };

  const handleOpenEditCard = (card: CardDto) => {
    setSelectedCard(card);
    setIsViewMode(false);
    setCardDrawerOpen(true);
  };

  const handleOpenViewCard = (card: CardDto) => {
    setSelectedCard(card);
    setIsViewMode(true);
    setCardDrawerOpen(true);
  };

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
      cell: (c) => c.institution?.name || '-',
    },
    {
      key: 'brand.name',
      header: 'Red / Franquicia',
      cell: (c) => c.brand?.name || '-',
    },
    {
      key: 'last_four',
      header: 'Terminación',
      cell: (c) => (
        <span className="font-mono text-xs text-text-secondary bg-surface-2 px-2 py-0.5 rounded-md border border-border-subtle">
          •••• {c.last_four}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      cell: (c) => {
        const labels: Record<string, string> = {
          CREDIT: 'Crédito',
          DEBIT: 'Débito',
          PREPAID: 'Prepago',
        };
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-text-secondary border border-border-subtle">
            {labels[c.type] || c.type}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenViewCard(c);
            }}
            className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-surface-2 rounded-lg transition-colors"
            title="Ver Detalle"
          >
            <Icon name="eye" size="sm" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditCard(c);
            }}
            className="p-1.5 text-text-muted hover:text-primary-600 hover:bg-surface-2 rounded-lg transition-colors"
            title="Editar"
          >
            <Icon name="edit" size="sm" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCardToDelete(c);
            }}
            className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
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
        description="Registra tus tarjetas y gestiona las redes y franquicias disponibles."
        actions={
          <>
            {activeTab === 'cards' && (
              <Button
                variant="primary"
                onClick={handleOpenCreateCard}
                className="w-full sm:w-auto"
              >
                <Icon name="plus" size="xs" className="mr-1.5" />
                Nueva Tarjeta
              </Button>
            )}
            {activeTab === 'brands' && (
              <Button
                variant="primary"
                onClick={() => brandsListRef.current?.openCreate()}
                className="w-full sm:w-auto"
              >
                <Icon name="plus" size="xs" className="mr-1.5" />
                Nueva Marca
              </Button>
            )}
          </>
        }
      />
      <PageContainer.Body variant="transparent">
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-max mb-4">
              <TabsTrigger value="cards">Tarjetas</TabsTrigger>
              <TabsTrigger value="brands">Redes (Marcas)</TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="pt-2">
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
                    searchFields={[
                      'name',
                      (c) => c.institution?.name || '',
                      (c) => c.brand?.name || '',
                    ]}
                    searchPlaceholder="Buscar tarjeta, banco o red..."
                    filters={FILTERS}
                    filterField={(c, f) => {
                      if (f === 'CREDIT') return c.type === 'CREDIT';
                      if (f === 'DEBIT') return c.type === 'DEBIT';
                      if (f === 'PREPAID') return c.type === 'PREPAID';
                      return true;
                    }}
                    defaultSort={{ column: 'name', direction: 'asc' }}
                    onRowClick={(c) => handleOpenViewCard(c)}
                    emptyMessage="No se encontraron tarjetas registradas."
                  />
                )}
              </QueryState>

              <AlertDialog
                open={!!cardToDelete}
                onOpenChange={(open) => !open && setCardToDelete(null)}
                title="¿Eliminar tarjeta?"
                description={`Estás a punto de eliminar la tarjeta "${cardToDelete?.name}". Esta acción no se puede deshacer.`}
                type="error"
                confirmText="Eliminar"
                isLoading={deleteCard.isPending}
                onConfirm={async () => {
                  if (!cardToDelete) return;
                  try {
                    await deleteCard.mutateAsync(cardToDelete.id);
                    setCardToDelete(null);
                  } catch (err) {
                    console.error('Error al eliminar la tarjeta', err);
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="brands">
              <CardBrandsList ref={brandsListRef} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Card Drawer */}
        <CardDrawer
          open={cardDrawerOpen}
          onOpenChange={setCardDrawerOpen}
          card={selectedCard}
          isView={isViewMode}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
