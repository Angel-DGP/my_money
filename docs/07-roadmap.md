# MyMoney — Roadmap Funcional

> **Documento**: 07 de 07
> **Versión**: 1.1.0 — Julio 2026
> **Estado**: APROBADO — congelado
> **Dependencias**: Documentos 01 al 06

---

> [!IMPORTANT]
> Este documento funciona como el **Backlog de Arquitectura**. Define el orden estricto de construcción para garantizar que nunca se construya el tejado antes que los cimientos.
> Cada fase es prerrequisito de la siguiente. No se avanzará a una nueva fase sin haber completado los criterios de aceptación de la actual.

---

## Índice

1. [Fase 0: Bootstrap (Setup Inicial)](#fase-0-bootstrap-setup-inicial)
2. [Fase 1: Foundation (Infraestructura y Auth)](#fase-1-foundation-infraestructura-y-auth)
3. [Fase 2: Core Domain & Data (Backend Base)](#fase-2-core-domain--data-backend-base)
4. [Fase 3: Design System Foundation (Frontend Base)](#fase-3-design-system-foundation-frontend-base)
5. [Fase 4: Motor de Transacciones (Full Stack)](#fase-4-motor-de-transacciones-full-stack)
6. [Fase 5: Inteligencia Financiera (Budgets & Goals)](#fase-5-inteligencia-financiera-budgets--goals)
7. [Fase 6: Operaciones Avanzadas y Pulido](#fase-6-operaciones-avanzadas-y-pulido)
8. [Definition of Done](#definition-of-done)

---

## Fase 0: Bootstrap (Setup Inicial)

**Objetivo**: Dejar el repositorio listo para empezar a escribir código, configurando todas las herramientas de desarrollo y calidad.

- `pnpm init` y setup de Turborepo (`apps/`, `packages/`).
- Inicializar Git.
- Configurar Husky (pre-commit hooks).
- Configurar Commitlint (convenciones de commits).
- Setup inicial de CI (GitHub Actions).
- Consolidar los ADR iniciales (`docs/adr/`).
- Docker (`docker-compose.yml` local para Postgres).
- Archivos `.env.example` centralizados.

*Criterio de éxito: El monorepo existe, los hooks de git bloquean commits mal formateados y el CI corre correctamente en el repositorio.*

---

## Fase 1: Foundation (Infraestructura y Auth)

**Objetivo**: Dejar la estructura del monorepo conectada y la base de datos levantada, junto con la seguridad base.

1. **Setup de Aplicaciones**
   - Crear `apps/web` (Next.js/Vite), `apps/api` (NestJS).
   - Crear `packages/shared`, `packages/ui`.
   - Configurar ESLint y Prettier compartidos.

2. **Base de Datos y Prisma**
   - Escribir `schema.prisma` basado 1:1 en el documento `04-erd.md`.
   - Generar la primera migración de Prisma.

3. **Core Auth y Security**
   - Configurar Session Authentication (HttpOnly Cookies) en NestJS.
   - Endpoints básicos de `/api/v1/auth/login` y `/auth/register`.
   - Interceptor global de auditoría (`AuditInterceptor`) para la tabla `audit_logs`.

*Criterio de éxito: Un usuario puede registrarse, iniciar sesión, recibir una cookie HttpOnly y acceder a rutas protegidas.*

---

## Fase 2: Core Domain & Data (Backend Base)

**Objetivo**: Implementar las reglas de negocio puras (Documento 02 y 03) y persistencia, sin preocuparse por la UI visual.

1. **Dominio Base (packages/shared)**
   - Implementar `Money`, `Currency`, `BalanceDelta`, `DateRange`.
   - Jerarquía de `DomainException`.
   - Clases base `DomainEvent` y `IRepository`.

2. **Agregados y Casos de Uso (apps/api)**
   - Módulo `Accounts`: Creación y validación (moneda, etc.).
   - Módulo `Categories`: Lógica de árbol (máx 2 niveles) e `is_system`.
   - Implementar las interfaces del dominio mediante repositorios Prisma (`PrismaAccountRepository`, etc).

3. **Endpoints API**
   - CRUD de Cuentas y Categorías según `05-api-contracts.md`.
   - Tests E2E de estos endpoints comprobando el mapeo de excepciones a HTTP.

*Criterio de éxito: La API expone endpoints funcionales para manejar cuentas y categorías, respetando los invariantes.*

---

## Fase 3: Design System Foundation (Frontend Base)

**Objetivo**: Traducir el documento `06-design-system.md` a código en `packages/ui` y montar el shell de la aplicación.

1. **Tokens y Tailwind**
   - Configurar `tailwind.config.ts` exportado desde `packages/ui` y consumido en `apps/web`.
   - Variables CSS para colores semánticos y modo oscuro.

2. **Librería de Componentes Atómicos**
   - Configurar Shadcn/ui.
   - Construir `Button`, `Input`, `Card`, `Modal`/`Dialog` respetando estrictamente los Design Tokens (radios, sombras, estados hover/focus).

3. **App Shell**
   - Crear el Layout principal (Sidebar colapsable, Header).
   - Integrar `ThemeProvider` (Light/Dark).
   - Conectar el Auth state de React con la validación de sesión (cookie).

*Criterio de éxito: La web se puede navegar, los componentes de UI se importan desde `@mymoney/ui` y el cambio Dark/Light mode es instantáneo.*

---

## Fase 4: Motor de Transacciones (Full Stack)

**Objetivo**: El corazón financiero de la aplicación. Entradas, salidas y transferencias.

1. **Backend: Transacciones**
   - Entidad `Transaction` y `TransferService`.
   - Implementar `EventEmitter2` para despachar `TransactionCreated`, `TransactionDeleted`, etc.
   - Handlers que actualizan `Account.current_balance`.
   - Endpoints de creación y paginación.

2. **Frontend: UI de Transacciones**
   - Construir `MoneyInput` y `CurrencyBadge` en el Design System.
   - Formulario de nueva transacción/transferencia.
   - Componente `DataTable` para listar transacciones paginadas.
   - Tarjetas de vista general de la Cuenta (`Balance Card`).

*Criterio de éxito: Un usuario puede registrar ingresos, egresos y transferencias. El balance de la cuenta se actualiza automáticamente (doble entrada en transferencias).*

---

## Fase 5: Inteligencia Financiera (Budgets & Goals)

**Objetivo**: Implementar la lógica proactiva y seguimiento financiero a largo plazo.

1. **Presupuestos (Budgets)**
   - Backend: Entidad `Budget`, lógica de solapamiento de fechas.
   - Handler: Escuchar eventos de transacciones para actualizar `executed_amount`.
   - Frontend: Tarjeta de Presupuesto con `ProgressIndicator` y alertas visuales.

2. **Metas de Ahorro (Goals)**
   - Backend: Entidad `Goal` y endpoint `/add-progress`.
   - Frontend: Vista de metas, formularios de aporte manual.

*Criterio de éxito: Al agregar un gasto en la Fase 4, la barra de progreso del presupuesto (Fase 5) avanza automáticamente sin recalcular toda la base de datos.*

---

## Fase 6: Operaciones Avanzadas y Pulido

**Objetivo**: Garantizar que el sistema sea de grado producción y brinde una experiencia premium.

1. **Sistemas Background**
   - Implementar el Cron Job de `balance_projections` para auditoría nocturna.
   - Feature flags (`feature_flags` table) para activar/desactivar opciones.

2. **Pulido Visual (Motion)**
   - Integrar Framer Motion para Page Transitions.
   - Animar la eliminación de filas en la tabla de transacciones.
   - Animar las barras de progreso de budgets al cargar.

3. **UX & Accesibilidad**
   - Revisión completa de navegación por teclado.
   - Manejo estandarizado de Estados Globales (`Empty`, `Error`, `Loading` Skeletons).

*Criterio de éxito: La aplicación funciona sin bugs y la experiencia de uso rivaliza con productos comerciales del sector.*

---

## Definition of Done

Una fase solo se considera **terminada** cuando:

- Todos los criterios de aceptación y tareas listadas se cumplen al 100%.
- La arquitectura sigue respetando los ADR vigentes (ej. sin fallas de Clean Architecture).
- No existen errores de TypeScript (`tsc --noEmit` pasa limpio).
- Lint (`eslint`) y tests unitarios/E2E pasan correctamente.
- El pipeline de CI/CD está en verde en GitHub Actions.
- La documentación técnica y READMEs están actualizados.
- No quedan comentarios tipo `TODO` críticos relacionados con esa fase en el código.

---

*Documento 07 de 07 — MyMoney Roadmap Funcional v1.1 — Julio 2026*
