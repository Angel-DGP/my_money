import { useState } from 'react';
import { useCards, useDeleteCard } from '../api/useCatalogs';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Icon, DataTable, type ColumnDef, PageContainer, Dialog, Modal, ModalHeader, ModalFooter } from '@mymoney/ui';
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
  const deleteCard = useDeleteCard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cards');
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
      key: 'type.name',
      header: 'Tipo',
      cell: (c) => c.type?.name,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => navigate(`/catalogs/cards/edit/${c.id}`)}>
            <Icon name="pencil" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" className="text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20" aria-label="Eliminar" onClick={() => setCardToDelete(c)}>
            <Icon name="trash" size="sm" />
          </Button>
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
            {activeTab === 'types' && (
              <Button onClick={() => navigate('/catalogs/card-types/new')} className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Tipo
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
          <TabsTrigger value="types">Tipos</TabsTrigger>
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

          <Dialog.Root open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
            <Dialog.Portal>
              <Modal>
                <ModalHeader>
                  <Dialog.Title className="text-lg font-semibold text-text-primary">¿Eliminar tarjeta?</Dialog.Title>
                  <Dialog.Description className="text-sm text-text-secondary mt-2">
                    Estás a punto de eliminar la tarjeta "{cardToDelete?.name}". Esta acción no se puede deshacer y puede fallar si la tarjeta tiene transacciones asociadas.
                  </Dialog.Description>
                </ModalHeader>
                <ModalFooter>
                  <Button variant="ghost" onClick={() => setCardToDelete(null)} disabled={deleteCard.isPending}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-error-500 hover:bg-error-600 text-white"
                    disabled={deleteCard.isPending}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!cardToDelete) return;
                      try {
                        await deleteCard.mutateAsync(cardToDelete.id);
                        setCardToDelete(null);
                      } catch (error) {
                        console.error("Error al eliminar la tarjeta", error);
                        // Dependiendo del error del backend (fk constraint), deberíamos mostrar un Toast aquí
                      }
                    }}
                  >
                    {deleteCard.isPending ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </ModalFooter>
              </Modal>
            </Dialog.Portal>
          </Dialog.Root>

        </TabsContent>

        <TabsContent value="brands">
          <div className="flex sm:hidden justify-end mb-4">
            <Button onClick={() => navigate('/catalogs/card-brands/new')} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Nueva Marca
            </Button>
          </div>
          <CardBrandsList />
        </TabsContent>

        <TabsContent value="types">
          <div className="flex sm:hidden justify-end mb-4">
            <Button onClick={() => navigate('/catalogs/card-types/new')} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Tipo
            </Button>
          </div>
          <CardTypesList />
        </TabsContent>
        </Tabs>
      </div>
      </PageContainer.Body>
    </PageContainer>
  );
}

