import {
  PageContainer,
  Card,
  Button,
  Input,
  Select,
  Checkbox,
  Switch,
  NumberInput,
  DatePicker,
  Heading,
  Text,
  Badge,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  StatCard,
  ProgressBar,
  BudgetProgress,
  GoalProgress,
  Amount,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AlertBanner,
  EmptyState
} from '@mymoney/ui';

export function UIKitPage() {
  return (
    <PageContainer>
      <PageContainer.Header
        title="UI Kit / Diseño de Interfaz"
        description="Visualiza todos los componentes de la aplicación en un solo lugar para ajustar estilos."
      />
      <PageContainer.Body variant="transparent">
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">

        {/* Tipografía */}
        <section>
          <Heading level="h2" className="mb-4">Tipografía</Heading>
          <Card className="flex flex-col gap-4">
            <Heading level="h1">Heading 1: Hola Mundo</Heading>
            <Heading level="h2">Heading 2: Hola Mundo</Heading>
            <Heading level="h3">Heading 3: Hola Mundo</Heading>
            <Heading level="h4">Heading 4: Hola Mundo</Heading>
            <Text variant="body" size="lg">Text Large Primary</Text>
            <Text variant="muted" size="base">Text Base Secondary</Text>
            <Text variant="small" size="sm">Text Small Tertiary</Text>
            <Text variant="body" weight="bold">Text Bold</Text>
          </Card>
        </section>

        {/* Botones */}
        <section>
          <Heading level="h2" className="mb-4">Botones</Heading>
          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Danger</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </Card>
        </section>

        {/* Formularios & Controles */}
        <section>
          <Heading level="h2" className="mb-4">Formularios & Controles</Heading>
          <Card className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Texto" placeholder="Placeholder..." />
            <Input label="Con Error" error="Este campo es obligatorio" defaultValue="Texto inválido" />
            <Input label="Búsqueda" placeholder="Buscar..." type="search" />
            <NumberInput label="Input Numérico con Steppers" min={1} max={31} placeholder="15" suffix="días" />
            <NumberInput label="Tasa de Interés" step={0.1} min={0} max={100} placeholder="16.5" suffix="%" />
            <DatePicker label="Selector de Fecha" />
            <Select label="Select Básico">
              <option value="1">Opción 1</option>
              <option value="2">Opción 2</option>
            </Select>
            <div className="flex items-center">
              <Checkbox id="check1" label="Checkbox Normal" />
            </div>
            <div className="flex items-center col-span-1 md:col-span-2">
              <Switch id="switch1" label="Toggle Estilo Apple" description="Activa o desactiva preferencias con animación fluida." defaultChecked />
            </div>
          </Card>
        </section>

        {/* Tarjetas y Estadísticas */}
        <section>
          <Heading level="h2" className="mb-4">Tarjetas de Estadísticas</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Balance Total"
              value={15250.00}
              currency="USD"
              icon="wallet"
              trend={{ value: 2.5, isPositive: true }}
            />
            <StatCard
              title="Gastos de Mes"
              value={3200.00}
              currency="USD"
              icon="pie-chart"
              trend={{ value: 5.1, isPositive: false }}
            />
            <StatCard
              title="Ahorros"
              value={8400.00}
              currency="USD"
              icon="piggy-bank"
              trend={{ value: 1.2, isPositive: true }}
            />
          </div>
        </section>

        {/* Barras de Progreso */}
        <section>
          <Heading level="h2" className="mb-4">Progreso (Presupuestos y Metas)</Heading>
          <Card className="flex flex-col gap-8">
            <div>
              <Text className="mb-2">Barra Genérica</Text>
              <ProgressBar progress={60} />
            </div>
            <div>
              <Text className="mb-2">Progreso de Presupuesto</Text>
              <BudgetProgress spent={400} total={500} currency="USD" />
            </div>
            <div>
              <Text className="mb-2">Progreso de Meta</Text>
              <GoalProgress current={1500} target={5000} currency="USD" />
            </div>
          </Card>
        </section>

        {/* Badges y Alertas */}
        <section>
          <Heading level="h2" className="mb-4">Badges & Alertas</Heading>
          <Card className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="secondary">Secondary</Badge>
            </div>

            <AlertBanner variant="info" title="Información" description="Este es un mensaje informativo para el usuario." />
            <AlertBanner variant="success" title="Éxito" description="La acción se completó correctamente." />
            <AlertBanner variant="warning" title="Advertencia" description="Ten cuidado con esta acción." />
            <AlertBanner variant="error" title="Error" description="Algo salió muy mal." />
          </Card>
        </section>

        {/* Tablas */}
        <section>
          <Heading level="h2" className="mb-4">Tablas</Heading>
          <Card padding="none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>02 Ago 2026</TableCell>
                  <TableCell className="font-medium">Compra Supermercado</TableCell>
                  <TableCell><Badge variant="success">Completado</Badge></TableCell>
                  <TableCell className="text-right text-error-500 font-medium"><Amount value={120.50} currency="USD" /></TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button variant="secondary" size="icon" aria-label="Editar">
                      <Icon name="pencil" size="sm" />
                    </Button>
                    <Button variant="secondary" size="icon" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950" aria-label="Eliminar">
                      <Icon name="trash" size="sm" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>01 Ago 2026</TableCell>
                  <TableCell className="font-medium">Nómina Quincenal</TableCell>
                  <TableCell><Badge variant="success">Completado</Badge></TableCell>
                  <TableCell className="text-right text-success-500 font-medium"><Amount value={2500.00} currency="USD" /></TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Icon name="pencil" size="sm" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30" aria-label="Eliminar">
                      <Icon name="trash" size="sm" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Empty States */}
        <section>
          <Heading level="h2" className="mb-4">Estados Vacíos (Empty States)</Heading>
          <EmptyState
            icon="inbox"
            title="No hay datos para mostrar"
            description="Aquí verás la información una vez que comiences a agregar datos al sistema."
            action={{
              label: "Crear Nuevo",
              onClick: () => { }
            }}
          />
        </section>

        {/* Tabs */}
        <section>
          <Heading level="h2" className="mb-4">Pestañas (Tabs)</Heading>
          <Card>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Pestaña 1</TabsTrigger>
                <TabsTrigger value="tab2">Pestaña 2</TabsTrigger>
                <TabsTrigger value="tab3">Pestaña 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4 text-text-secondary">Contenido de la primera pestaña.</TabsContent>
              <TabsContent value="tab2" className="p-4 text-text-secondary">Contenido de la segunda pestaña.</TabsContent>
              <TabsContent value="tab3" className="p-4 text-text-secondary">Contenido de la tercera pestaña.</TabsContent>
            </Tabs>
          </Card>
        </section>

      </div>
      </PageContainer.Body>
    </PageContainer>
  );
}
