import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageContainer } from '@mymoney/ui';
import { Tabs, TabsList, TabsTrigger } from '@mymoney/ui';

export function CatalogsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the current tab from the URL
  const pathParts = location.pathname.split('/');
  // If the URL is just /catalogs, default to institutions
  const currentTab = pathParts[pathParts.length - 1];
  const activeTab = currentTab === 'catalogs' || !currentTab ? 'institutions' : currentTab;

  const handleTabChange = (val: string) => {
    navigate(`/catalogs/${val}`);
  };

  return (
    <PageContainer>
      <PageContainer.Header
        title="Catálogos y Configuración"
        description="Gestiona tus bancos, tarjetas, suscripciones y compras frecuentes."
      />
      <PageContainer.Body variant="transparent" className="p-0 border-none shadow-none bg-transparent">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 w-max mx-auto sm:mx-0">
            <TabsTrigger value="institutions">Bancos e Instituciones</TabsTrigger>
            <TabsTrigger value="cards">Mis Tarjetas</TabsTrigger>
            <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
            <TabsTrigger value="products">Compras Frecuentes</TabsTrigger>
          </TabsList>
          
          <div className="pt-2">
            <Outlet />
          </div>
        </Tabs>
      </PageContainer.Body>
    </PageContainer>
  );
}
