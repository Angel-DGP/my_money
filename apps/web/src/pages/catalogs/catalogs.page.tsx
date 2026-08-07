import { PageContainer } from '@mymoney/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@mymoney/ui';
import { InstitutionsTab } from '../../features/catalogs/ui/InstitutionsTab';
import { CardsTab } from '../../features/catalogs/ui/CardsTab';
import { SubscriptionsTab } from '../../features/catalogs/ui/SubscriptionsTab';
import { ProductServicesTab } from '../../features/catalogs/ui/ProductServicesTab';

export function CatalogsPage() {
  return (
    <PageContainer>
      <PageContainer.Header
        title="Catálogos y Configuración"
        description="Gestiona tus bancos, tarjetas, suscripciones y compras frecuentes."
      />
      <PageContainer.Body variant="transparent" className="p-0 border-none shadow-none bg-transparent">
        <Tabs defaultValue="institutions" className="w-full">
          <TabsList className="mb-6 w-max mx-auto sm:mx-0">
            <TabsTrigger value="institutions">Bancos e Instituciones</TabsTrigger>
            <TabsTrigger value="cards">Mis Tarjetas</TabsTrigger>
            <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
            <TabsTrigger value="products">Compras Frecuentes</TabsTrigger>
          </TabsList>

          <TabsContent value="institutions">
            <InstitutionsTab />
          </TabsContent>

          <TabsContent value="cards">
            <CardsTab />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsTab />
          </TabsContent>

          <TabsContent value="products">
            <ProductServicesTab />
          </TabsContent>
        </Tabs>
      </PageContainer.Body>
    </PageContainer>
  );
}
