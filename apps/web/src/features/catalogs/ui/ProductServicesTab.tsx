import { useState } from 'react';
import { useProductServices, useDeleteProductService } from '../api/useCatalogs';
import { Button, Table, TableBody, TableCell, TableRow, Card, Icon, TableHeader, PageContainer, Dialog, Modal, ModalHeader, ModalFooter } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTableState, DataTableToolbar, SortableHeader, TablePagination } from '@mymoney/ui';
import type { ProductServiceDto } from '../../../shared/api/dto/catalogs.dto';

export function ProductServicesTab() {
  const { data: products, isLoading, isError, error, refetch } = useProductServices();
  const deleteProduct = useDeleteProductService();
  const navigate = useNavigate();
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const {
    search,
    setSearch,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalFiltered,
    paginated,
  } = useTableState<ProductServiceDto>({
    data: products || [],
    pageSize: 10,
    searchFields: ['name'],
    defaultSort: { column: 'name', direction: 'asc' },
  });

  return (
    <PageContainer>
      <PageContainer.Header
        title="Productos y Servicios Frecuentes"
        description="Guarda nombres de comercios o servicios (ej. Supermaxi, Uber) para autocompletar rápidamente tus gastos."
        actions={
          <Button onClick={() => navigate('/catalogs/products/new')} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          <QueryState
            data={products}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
          >
            {() => (
              <div className="space-y-4">
                <DataTableToolbar
                  search={search}
                  onSearchChange={setSearch}
                  placeholder="Buscar producto o comercio..."
                />

                <Card padding="none" className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell asChild>
                          <th>
                            <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                              Nombre / Comercio
                            </SortableHeader>
                          </th>
                        </TableCell>
                        <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                          <th>Categoría por Defecto</th>
                        </TableCell>
                        <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                          <th>Acciones</th>
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center text-text-secondary">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <ShoppingBag className="w-8 h-8 text-text-tertiary" />
                              <p>{search ? 'No se encontraron resultados.' : 'No tienes productos frecuentes registrados.'}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginated.map((prod: ProductServiceDto) => (
                          <TableRow key={prod.id} className="hover:bg-surface-hover transition-colors">
                            <TableCell className="font-medium">{prod.name}</TableCell>
                            <TableCell className="text-text-secondary">
                              {prod.category ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 text-xs font-medium">
                                  {prod.category.name}
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => navigate(`/catalogs/products/${prod.id}/edit`)}>
                                <Icon name="pencil" size="sm" />
                              </Button>
                              <Button variant="ghost" size="icon" aria-label="Eliminar" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10" onClick={() => setProductToDelete(prod.id)}>
                                <Icon name="trash" size="sm" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>

                {totalPages > 1 && (
                  <TablePagination
                    page={page}
                    totalPages={totalPages}
                    totalFiltered={totalFiltered}
                    pageSize={10}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
          </QueryState>
        </div>
      </PageContainer.Body>

      <Dialog.Root open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <Dialog.Portal>
          <Modal>
            <ModalHeader>
              <Dialog.Title className="text-lg font-semibold text-text-primary">Eliminar Comercio/Producto</Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary mt-2">
                ¿Estás seguro de que deseas eliminar este comercio? Esta acción no se puede deshacer.
              </Dialog.Description>
            </ModalHeader>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setProductToDelete(null)} disabled={deleteProduct.isPending}>
                Cancelar
              </Button>
              <Button 
                className="bg-error-500 hover:bg-error-600 text-white" 
                onClick={() => {
                  if (productToDelete) {
                    deleteProduct.mutate(productToDelete, {
                      onSuccess: () => setProductToDelete(null)
                    });
                  }
                }}
                disabled={deleteProduct.isPending}
                leftIcon={deleteProduct.isPending ? 'loader-2' : 'trash'}
              >
                {deleteProduct.isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </ModalFooter>
          </Modal>
        </Dialog.Portal>
      </Dialog.Root>
    </PageContainer>
  );
}
