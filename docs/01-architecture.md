# MyMoney — Documento de Arquitectura Técnica Oficial

> **Versión**: 2.1.0 — Julio 2026 (**DOCUMENTO DEFINITIVO**)
> **Clasificación**: Documento oficial de arquitectura y guía de desarrollo
> **Changelog**:
> - v1.0: Arquitectura inicial
> - v2.0: Architecture Review — 15 mejoras aplicadas
> - v2.1: Refinamientos finales — 8 ajustes + Documento 7 Business Rules
> **Alcance**: Frontend · Backend · Base de Datos · DevOps · Seguridad · Testing

---

## Índice

1. [Visión General](#1-visión-general)
2. [Los 7 documentos antes del código](#2-los-7-documentos-antes-del-código)
3. [Arquitectura Recomendada](#3-arquitectura-recomendada)
4. [Stack Tecnológico Justificado](#4-stack-tecnológico-justificado)
5. [Backend — Estructura y Organización](#5-backend--estructura-y-organización)
6. [Frontend — Estructura y Organización](#6-frontend--estructura-y-organización)
7. [Base de Datos — Diseño de Entidades](#7-base-de-datos--diseño-de-entidades)
8. [Seguridad y Autenticación](#8-seguridad-y-autenticación)
9. [Domain Events y Event Bus](#9-domain-events-y-event-bus)
10. [Feature Flags](#10-feature-flags)
11. [Observabilidad](#11-observabilidad)
12. [Error Codes del Dominio](#12-error-codes-del-dominio)
13. [Calidad del Código](#13-calidad-del-código)
14. [Estrategia de Testing](#14-estrategia-de-testing)
15. [DevOps y CI/CD](#15-devops-y-cicd)
16. [Escalabilidad](#16-escalabilidad)
17. [Riesgos Técnicos](#17-riesgos-técnicos)
18. [ADRs — Architecture Decision Records](#18-adrs--architecture-decision-records)
19. [Roadmap Técnico](#19-roadmap-técnico)
20. [Decisiones Irrompibles](#20-decisiones-irrompibles)

---

## 1. Visión General

### 1.1 Problema a resolver

Un sistema de gestión financiera personal que comienza como una aplicación monousuario pero debe crecer hacia una plataforma multi-usuario con capacidades de IA, OCR, sincronización offline y API pública, sin reescrituras estructurales.

### 1.2 Principios guía de diseño

| Principio | Aplicación concreta |
|---|---|
| **Separación de responsabilidades** | Capas independientes: dominio, aplicación, infraestructura |
| **Inversión de dependencias** | El dominio no conoce la base de datos ni el framework |
| **Open/Closed** | Agregar funcionalidades sin modificar código existente |
| **Bajo acoplamiento** | Módulos intercambiables sin efecto cascada |
| **Alta cohesión** | Cada módulo hace una cosa y la hace bien |
| **Evolutividad** | Cada decisión hoy no debe cerrar puertas mañana |

### 1.3 Infraestructura — Filosofía de Neutralidad

> [!IMPORTANT]
> El backend es un **contenedor Docker**. Nada más. Puede desplegarse en Railway, Render, Fly.io, un VPS, o infraestructura propia sin modificar una línea de código de negocio. El proveedor es un detalle de configuración, no una dependencia arquitectónica.

| Servicio | Proveedor inicial | Por qué | Alternativas documentadas |
|---|---|---|---|
| Frontend hosting | Vercel Free | Integración nativa con GitHub, CDN global, SSL automático | Cloudflare Pages, Netlify, S3+CloudFront |
| Backend hosting | Railway Free | Sin cold starts, $5/mes en créditos, deploy via Docker | Render, Fly.io, VPS (DigitalOcean, Hetzner) |
| Base de datos | Neon (PostgreSQL) | Serverless, branching por branch de Git, 512 MB free | Supabase, ElephantSQL, PostgreSQL propio |
| CI/CD | GitHub Actions Free | 2000 min/mes free, integración nativa | GitLab CI, Bitbucket Pipelines, Jenkins |

**ADR-005** documenta la decisión de Railway y sus criterios de migración. Cuando Railway deje de ser conveniente, el criterio de migración es simple: cualquier plataforma que ejecute Docker sin cold starts en el tier requerido.

---

## 2. Los 7 Documentos Antes del Código

> [!IMPORTANT]
> Este orden no es opcional. Es la diferencia entre construir sobre roca o sobre arena.
> Antes de escribir una sola línea de código, estos siete documentos deben estar aprobados.

Invertir tiempo en el diseño inicial reduce drásticamente las refactorizaciones estructurales. Una decisión de modelo de dominio que se cambia en la semana 8 puede invalidar 3 semanas de trabajo.

### El orden es deliberado

```
1. Arquitectura del sistema          ← (este documento) ✅ COMPLETADO v2.1
2. Business Rules                    ← invariantes del negocio, lo que nunca puede romperse
3. Modelo de dominio                 ← entidades, lenguaje ubicuo, Value Objects
4. ERD — Modelo de base de datos     ← entidades, relaciones, índices
5. Contratos de API (OpenAPI)        ← endpoints, DTOs, respuestas, error codes
6. Design System                     ← tokens, componentes, tipografía, espaciado
7. Roadmap funcional                 ← features ordenadas por valor de negocio
```

### Por qué Business Rules va antes que el Modelo de Dominio

Las **Business Rules** son las restricciones absolutas del sistema: qué puede y qué no puede pasar en el negocio, independientemente de la tecnología. Son el contrato con la realidad financiera.

El **Modelo de Dominio** es la representación técnica de esas reglas. Si las reglas no están documentadas primero, el modelo puede omitir invariantes críticas. Un bug causado por una invariante omitida en el dominio es difícil de rastrear y costoso de corregir.

**Ejemplo**: La regla "una cuenta no puede eliminarse si tiene transacciones" debe estar en Business Rules antes de que el modelo de dominio defina cómo implementar `deleteAccount()`. Si el modelo se diseña primero, puede que la validación quede en el servicio, en el controlador, o en ningún lado.

**El ERD (4)** es consecuencia del dominio, no al revés. Si diseñas la base de datos primero, terminas modelando tablas, no conceptos de negocio.

**La API (5)** es el contrato entre frontend y backend. Si está definida primero, ambos lados pueden desarrollarse en paralelo y el `packages/sdk` se genera automáticamente.

**El Design System (6)** permite construir interfaces consistentes desde el primer componente.

**El Roadmap (7)** ordena el trabajo por valor de negocio, no por conveniencia técnica.

---

## 3. Arquitectura Recomendada

### 3.1 Decisión central: Modular Monolith + Clean Architecture + Domain Events

#### Arquitectura elegida: Modular Monolith con Clean Architecture interna y Domain Events

**¿Por qué no microservicios desde el inicio?**
Los microservicios resuelven problemas de escala de equipos y de tráfico que este proyecto no tiene. Introducirlos ahora agregaría complejidad operativa sin beneficio. Sin embargo, los módulos deben estar diseñados para poder extraerse como microservicio en el futuro con el mínimo cambio.

**¿Por qué no DDD puro?**
El dominio financiero personal no es lo suficientemente complejo para justificar Aggregates completos y Domain Events distribuidos desde el inicio. Adoptaremos conceptos de DDD progresivamente. Sin embargo, **sí usaremos Domain Events internos desde el día 1**, porque son el mecanismo que permite que `Transaction` no sepa nada de `Budget`, `Dashboard` ni `AI`.

### 3.2 Diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                  (Controllers / Resolvers)                   │
│              Valida entrada · Transforma respuesta           │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│              (Use Cases · Event Handlers)                    │
│              Orquesta · Publica Domain Events                │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                            │
│       (Entities · Value Objects · Domain Events · Interfaces)│
│              NÚCLEO PURO · Sin dependencias externas         │
├─────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER                        │
│    (Prisma Repos · Mailers · Storage · Event Bus · Cache)   │
│              Implementa contratos del dominio                │
└─────────────────────────────────────────────────────────────┘
```

**Regla de oro de dependencias**: Las flechas de dependencia siempre apuntan hacia adentro. El dominio no importa nada del exterior. Nunca.

---

## 4. Stack Tecnológico Justificado

### 4.1 Infraestructura — Railway sobre Render

**Decisión**: Railway en lugar de Render para el backend.

**Justificación técnica**: Render Free hiberna el servidor tras 15 minutos de inactividad. El cold start puede tardar entre 20-30 segundos. En una aplicación financiera personal donde la experiencia de login es crítica, esto es inaceptable.

Railway ofrece $5 de créditos mensuales gratuitos, sin hibernación, con deploys desde GitHub push y soporte nativo de Docker. Para una API NestJS liviana, $5/mes cubre aproximadamente 500 horas de ejecución — suficiente para uso personal.

**Trade-off aceptado**: Railway tiene límite de créditos, no límite de tiempo. Si el proyecto crece en tráfico, se agotarán los créditos antes. La migración a un plan pago o a un VPS propio es trivial porque el backend corre en Docker.

### 4.2 Backend

#### NestJS + TypeScript

**Justificación**: NestJS es el único framework Node.js que ofrece IoC Container, decoradores, módulos y una estructura que hace que Clean Architecture sea natural de implementar. Express/Fastify son demasiado minimalistas para una aplicación de este tamaño; habría que reinventar todo el sistema de DI.

**Trade-off**: Más opinionado que Express. Si en el futuro se quiere migrar a Bun o Deno, el código de dominio es agnóstico — solo los adaptadores de infraestructura necesitan reescribirse.

#### Prisma ORM

**Justificación**: Prisma ofrece type-safety completa, migraciones declarativas y una DX excelente. El schema actúa como fuente de verdad para la base de datos.

**Trade-off aceptado**: Prisma genera un cliente específico para tu schema. Si cambias de PostgreSQL a otra base de datos, necesitas ajustar el schema. Este trade-off es aceptable porque el repositorio actúa como adaptador — los servicios de dominio no importan Prisma directamente.

#### PostgreSQL (Neon)

**Justificación**: ACID, soporte para JSON, full-text search nativo, extensiones (pgvector para IA futura, pg_cron para trabajos programados), mejor ecosistema de herramientas.

**Neon sobre Supabase**: Neon ofrece serverless PostgreSQL con branching de base de datos — útil para tener ambientes separados por branch de Git. Supabase incluye más servicios que no se necesitan (Auth propio, Storage propio) y podría crear dependencia de plataforma.

### 4.3 Frontend

#### React 19 + Vite + TypeScript

**Justificación**: React 19 con mejoras en concurrencia y Suspense más maduro. Vite es el bundler más rápido para desarrollo. TypeScript es no negociable en un proyecto que se mantendrá durante años.

**¿Por qué no Next.js?** Este proyecto es una aplicación que requiere autenticación completa — no hay contenido público que necesite SEO. Una SPA es más simple, más rápida de construir y evita la complejidad de SSR. Si en el futuro se quiere una landing page pública, se puede crear un repositorio separado con Next.js.

#### TanStack Query v5

**Justificación**: Manejo de estado del servidor completamente separado del estado de UI. Caching, invalidación, sincronización en background, optimistic updates. Es el estándar de facto para esto.

#### TailwindCSS v4

**Justificación**: Utilidades CSS, consistencia visual, purging automático. Diseñado para componentes, no para hojas de estilo en cascada.

#### React Hook Form + Zod

**Justificación**: RHF minimiza re-renders. Zod para validación de esquemas compartidos entre frontend y backend vía `packages/shared`.

> [!TIP]
> Los schemas de Zod se definen en `packages/shared` y se consumen tanto en el frontend (validación de formularios) como en el backend (validación de DTOs). Una sola fuente de verdad para las reglas de validación.

---

## 5. Backend — Estructura y Organización

### 5.1 Estructura de carpetas (Monorepo Turborepo)

```
my-money/
├── apps/
│   ├── api/                              # Backend NestJS
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── core/                     # Infraestructura compartida
│   │   │   │   ├── config/
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   ├── database.config.ts
│   │   │   │   │   └── session.config.ts
│   │   │   │   ├── database/
│   │   │   │   │   ├── prisma.service.ts
│   │   │   │   │   └── database.module.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── event-bus.interface.ts
│   │   │   │   │   ├── event-bus.service.ts  # In-process EventEmitter2
│   │   │   │   │   └── events.module.ts
│   │   │   │   ├── logger/
│   │   │   │   │   ├── logger.service.ts     # Pino wrapper
│   │   │   │   │   └── logger.module.ts
│   │   │   │   ├── cache/
│   │   │   │   │   ├── cache.interface.ts
│   │   │   │   │   └── cache.module.ts       # In-memory → Redis ready
│   │   │   │   ├── feature-flags/
│   │   │   │   │   ├── feature-flags.service.ts
│   │   │   │   │   └── feature-flags.module.ts
│   │   │   │   ├── exceptions/
│   │   │   │   │   ├── domain.exception.ts
│   │   │   │   │   ├── not-found.exception.ts
│   │   │   │   │   └── global-exception.filter.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── transform.interceptor.ts
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   └── audit.interceptor.ts  # Registra cambios automáticamente
│   │   │   │   ├── guards/
│   │   │   │   │   ├── session.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   └── decorators/
│   │   │   │       ├── current-user.decorator.ts
│   │   │   │       ├── public.decorator.ts
│   │   │   │       └── roles.decorator.ts
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── accounts/
│   │   │   │   ├── transactions/
│   │   │   │   ├── categories/
│   │   │   │   ├── budgets/
│   │   │   │   ├── goals/
│   │   │   │   ├── reports/
│   │   │   │   ├── attachments/
│   │   │   │   ├── analytics/            # user_actions tracking
│   │   │   │   └── integrations/         # IA + imports + exports
│   │   │   │       ├── ai/
│   │   │   │       │   ├── providers/
│   │   │   │       │   │   ├── ai-provider.interface.ts
│   │   │   │       │   │   ├── openai.provider.ts
│   │   │   │       │   │   ├── anthropic.provider.ts
│   │   │   │       │   │   └── deepseek.provider.ts
│   │   │   │       │   └── ai.module.ts
│   │   │   │       ├── imports/
│   │   │   │       │   ├── strategies/
│   │   │   │       │   │   ├── import-strategy.interface.ts
│   │   │   │       │   │   ├── excel.strategy.ts
│   │   │   │       │   │   ├── csv.strategy.ts
│   │   │   │       │   │   └── bank.strategy.ts
│   │   │   │       │   └── imports.module.ts
│   │   │   │       └── exports/
│   │   │   │           ├── strategies/
│   │   │   │           │   ├── export-strategy.interface.ts
│   │   │   │           │   ├── pdf.strategy.ts
│   │   │   │           │   └── excel.strategy.ts
│   │   │   │           └── exports.module.ts
│   │   │   │
│   │   │   └── shared/
│   │   │       └── storage/
│   │   │           ├── storage.interface.ts
│   │   │           ├── local.storage.ts    # Desarrollo
│   │   │           └── s3.storage.ts       # Producción (R2, S3)
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   │
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                              # Frontend React
│
├── packages/
│   ├── shared/                           # Tipos y schemas compartidos
│   │   ├── src/
│   │   │   ├── schemas/                  # Zod schemas (front + back)
│   │   │   │   ├── transaction.schema.ts
│   │   │   │   ├── account.schema.ts
│   │   │   │   └── budget.schema.ts
│   │   │   └── types/                    # TypeScript interfaces
│   │   └── package.json
│   │
│   ├── ui/                               # Design System (librería)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Card/
│   │   │   │   ├── Dropdown/
│   │   │   │   ├── Select/
│   │   │   │   ├── Toast/
│   │   │   │   ├── Dialog/
│   │   │   │   ├── Calendar/
│   │   │   │   ├── DatePicker/
│   │   │   │   ├── MoneyInput/           # Input numérico con símbolo de moneda
│   │   │   │   └── CurrencyInput/        # Selector de moneda ISO 4217 (USD, EUR, MXN...)
│   │   │   └── tokens/
│   │   │       ├── colors.ts
│   │   │       ├── spacing.ts
│   │   │       └── typography.ts
│   │   └── package.json
│   │
│   ├── sdk/                              # Cliente API type-safe (auto-generado)
│   │   ├── src/
│   │   │   ├── client.ts                 # Cliente base (Axios)
│   │   │   └── resources/
│   │   │       ├── transactions.ts        # api.transactions.create(dto)
│   │   │       ├── accounts.ts
│   │   │       ├── budgets.ts
│   │   │       └── reports.ts
│   │   └── package.json                  # Generado desde openapi.json
│   │
│   └── config/                           # Configs compartidas (ESLint, TS, Tailwind)
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── docs/
│   ├── architecture/
│   │   ├── ADR/
│   │   │   ├── ADR-001-nestjs.md
│   │   │   ├── ADR-002-prisma.md
│   │   │   ├── ADR-003-postgresql.md
│   │   │   ├── ADR-004-fsd-frontend.md
│   │   │   ├── ADR-005-railway.md
│   │   │   ├── ADR-006-pwa.md
│   │   │   ├── ADR-007-session-auth.md
│   │   │   ├── ADR-008-turborepo.md
│   │   │   ├── ADR-009-bigjs-over-decimaljs.md
│   │   │   └── ADR-010-packages-sdk.md
│   │   └── diagrams/
│   ├── 01-architecture.md               # ✅ COMPLETADO (este documento)
│   ├── 02-business-rules.md             # Invariantes del negocio
│   ├── 03-domain-model.md               # Entidades, lenguaje ubicuo
│   ├── 04-erd.md                        # Diagrama de entidades
│   ├── 05-api-contracts.md              # OpenAPI spec summary
│   ├── 06-design-system.md              # Tokens, componentes
│   └── 07-roadmap.md                    # Roadmap funcional
│
├── turbo.json
├── package.json
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

### 5.2 Anatomía de un módulo: Transactions (patrón canónico)

Este patrón se replica en todos los módulos:

```
modules/transactions/
├── domain/
│   ├── transaction.entity.ts             # Entidad pura, lógica de negocio
│   ├── money.value-object.ts             # Value Object: { value, currency }
│   ├── transaction-type.enum.ts          # INCOME | EXPENSE | TRANSFER
│   ├── events/
│   │   ├── transaction-created.event.ts  # Domain Event
│   │   ├── transaction-updated.event.ts
│   │   └── transaction-deleted.event.ts
│   └── transaction.repository.interface.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-transaction.use-case.ts
│   │   ├── update-transaction.use-case.ts
│   │   ├── soft-delete-transaction.use-case.ts
│   │   └── get-transactions.use-case.ts
│   └── event-handlers/
│       └── update-budget-on-transaction.handler.ts  # Reacciona a TransactionCreated
│
├── infrastructure/
│   └── prisma-transaction.repository.ts
│
├── dto/
│   ├── create-transaction.dto.ts
│   ├── update-transaction.dto.ts
│   └── transaction-filter.dto.ts
│
├── transactions.controller.ts
└── transactions.module.ts
```

### 5.3 Value Object: Money

En lugar de un campo `amount: DECIMAL`, el dominio usa un Value Object que encapsula tanto el valor como la moneda.

```
Money
├── value: Big           ← big.js (no decimal.js — más pequeño, suficiente)
├── currency: Currency    ← ISO 4217 enum
├── add(other: Money): Money
├── subtract(other: Money): Money
├── isGreaterThan(other: Money): boolean
└── format(locale?: string): string    ← "$1,250.00" | "MX$1,250.00" | "€1.250,00"
```

**¿Por qué big.js y no decimal.js?** big.js pesa ~6KB minificado vs ~32KB de decimal.js. Para las operaciones que necesitamos (sumar, restar, comparar, formatear), big.js es más que suficiente. decimal.js tiene features (funciones trigonométricas, notación científica) que un sistema financiero personal jamás usará.

**¿Por qué Value Object y no solo dos campos?** Porque `Money` tiene comportamiento. No puedes sumar `USD 100` con `MXN 100` sin conversión. Esa regla de negocio vive en `Money`, no en el servicio, no en el controlador.

**Trade-off aceptado**: En la base de datos, `Money` se persiste como dos columnas (`amount DECIMAL(15,4)` + `currency CHAR(3)`). Prisma no tiene concepto de Value Objects — la conversión ocurre en el repositorio.

### 5.4 Soft Delete con auditoría completa

**Todas las entidades modificables** siguen este patrón:

```
Campos de auditoría estándar:
├── created_at    TIMESTAMPTZ    NOT NULL
├── created_by    UUID           FK → users (para automatizaciones futuras)
├── updated_at    TIMESTAMPTZ    NOT NULL
├── updated_by    UUID           FK → users
├── deleted_at    TIMESTAMPTZ    NULL       ← NULL = activo
└── deleted_by    UUID           NULL       FK → users
```

**¿Por qué `createdBy/updatedBy/deletedBy` si hay un solo usuario?**
Porque en 6 meses habrá automatizaciones. La IA clasificará una transacción → `updatedBy = system_ai_agent_id`. El importador de Excel creará 200 transacciones → `createdBy = import_job_id`. Sin este campo, no sabes qué modificó qué.

**Implementación**: Un interceptor global (`AuditInterceptor`) inyecta automáticamente el `userId` del contexto en todos los writes. El desarrollador no tiene que recordar hacerlo manualmente.

### 5.5 Componentes transversales

#### Response Format (inmutable)

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "totalPages": 10, "total": 100 },
  "timestamp": "2026-07-28T21:00:00Z",
  "version": "v1"
}
```

#### API Versioning — /api/v1 desde el día 1

Todo el backend expone sus endpoints bajo el prefijo `/api/v1/`. Aunque hoy no exista `/api/v2/`, la convención está establecida.

**¿Por qué desde el día 1?** Porque cambiar las URLs después de que el frontend (y eventualmente un SDK) las consume es un breaking change costoso. Con `/api/v1/` desde el inicio:
- El frontend siempre llama a URLs versionadas
- El `packages/sdk` genera clients versionados
- Cuando exista API pública, `/api/v2/` puede introducir cambios sin afectar clientes v1
- Los ADRs documentan qué cambió entre versiones

```
Estrategia de versionado:
- URL versioning: /api/v1/transactions  (no headers, más transparente)
- Una versión nueva no elimina la anterior hasta deprecación documentada
- Deprecación: header Deprecation: true + Sunset: fecha en respuestas v1
```

#### Rate Limiting

```
IP global:        100 req/min
Auth endpoints:   10 req/min (anti-brute-force)
API por usuario:  300 req/min
Export endpoints: 10 req/hora
```

---

## 6. Frontend — Estructura y Organización

### 6.1 Feature-Sliced Design (FSD) — Confirmado

| Estructura | Decisión | Razón |
|---|---|---|
| Atomic Design | ❌ | Confuso a qué nivel pertenece la lógica de negocio |
| Feature-Based | ❌ | Sin convenciones de capas internas |
| **Feature-Sliced Design** | ✅ | Convenciones estrictas, importaciones validadas por ESLint |
| Clean Frontend / DDD Frontend | ❌ | Over-engineering para React sin ganancia práctica |

### 6.2 Estructura del frontend

```
apps/web/src/
├── app/                           # CAPA: App — Configuración global
│   ├── providers/
│   │   ├── QueryProvider.tsx      # TanStack Query
│   │   ├── ThemeProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── router/
│   │   ├── index.tsx              # React Router v7
│   │   ├── PrivateRoute.tsx
│   │   └── routes.ts              # CONSTANTES de rutas (nunca strings hardcodeados)
│   └── styles/
│       ├── globals.css
│       └── design-tokens.css
│
├── pages/                         # CAPA: Pages — Composición de features
│   ├── dashboard/
│   ├── transactions/
│   ├── budgets/
│   ├── goals/
│   ├── reports/
│   └── settings/
│
├── widgets/                       # CAPA: Widgets — Bloques de UI complejos
│   ├── FinancialSummaryCard/
│   ├── TransactionTable/
│   ├── SpendingChart/
│   └── Sidebar/
│
├── features/                      # CAPA: Features — Lógica de negocio UI
│   ├── auth/
│   ├── transactions/
│   │   ├── api/
│   │   │   ├── transactions.api.ts
│   │   │   └── transactions.queries.ts
│   │   ├── model/
│   │   │   ├── transaction.schema.ts  # Re-exporta desde packages/shared
│   │   │   └── transaction.types.ts
│   │   └── ui/
│   │       ├── CreateTransactionForm.tsx
│   │       ├── TransactionFilters.tsx
│   │       └── TransactionRow.tsx
│   ├── categories/
│   ├── budgets/
│   ├── goals/
│   └── reports/
│
├── entities/                      # CAPA: Entities — Modelos de datos UI
│   ├── transaction/
│   │   ├── transaction.model.ts
│   │   └── transaction.utils.ts   # Formatters de Money, fechas
│   ├── category/
│   ├── account/
│   └── user/
│
└── shared/                        # CAPA: Shared — Utilidades sin negocio
    ├── api/
    │   ├── http-client.ts         # Axios con interceptors de sesión
    │   └── api-response.types.ts
    ├── storage/
    │   ├── storage.interface.ts   # StorageProvider abstraction
    │   ├── remote.storage.ts      # API calls (activo hoy)
    │   ├── local.storage.ts       # LocalStorage (preparado)
    │   └── indexeddb.storage.ts   # IndexedDB (offline futuro)
    ├── lib/
    │   ├── date.ts
    │   ├── currency.ts
    │   └── money.ts               # Formateadores de Money VO
    └── hooks/
        ├── useDebounce.ts
        ├── usePagination.ts
        └── useFeatureFlag.ts      # Hook para feature flags
```

### 6.3 Design System como librería separada (`packages/ui`)

**¿Por qué separar el Design System del frontend?**

Si el Design System está dentro de `apps/web`, está acoplado a la aplicación. Cuando en el futuro haya una app móvil (React Native), una extensión de Chrome, o una landing page, cada una tendrá que reimplementar `Button`, `Input`, `Modal`.

`packages/ui` es una librería independiente que cualquier app del monorepo puede consumir. Actualizar el estilo del `Button` en un lugar afecta todas las apps.

```
packages/ui/src/components/
├── Button/         ← variantes: primary, secondary, ghost, danger
├── Input/          ← variantes: text, number, email, password
├── Modal/
├── Card/
├── Dropdown/
├── Select/
├── Toast/          ← Sonner wrapper
├── Dialog/         ← Confirmación de acciones destructivas
├── Calendar/
├── DatePicker/
└── MoneyInput/     ← Input especializado: solo números, símbolo de moneda, decimales
```

`MoneyInput` merece mención especial: es un componente específico del dominio financiero. Maneja separadores de miles, decimales configurables por moneda, y retorna un objeto `{ value: number, currency: string }`.

### 6.4 StorageProvider — Preparación para Offline

```typescript
// shared/storage/storage.interface.ts
interface StorageProvider<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  list(prefix: string): Promise<T[]>
  sync?(): Promise<void>          // Solo implementado en offline providers
}
```

Hoy: `RemoteStorageProvider` llama a la API.
Fase Offline: `IndexedDBStorageProvider` persiste localmente, implementa `sync()` para reconciliar con el servidor cuando haya conexión.

El código de aplicación no sabe qué provider está usando. El provider se configura por ambiente o por feature flag.

### 6.5 Estado del cliente

| Tipo de estado | Solución | Razón |
|---|---|---|
| Datos remotos (servidor) | TanStack Query | Cache, invalidación, sync automático |
| Sesión de usuario | Zustand (persistido) | Estado de cliente puro |
| Formularios | React Hook Form | Mínimos re-renders |
| UI local (modales, toggles) | useState local | No necesita ser global |
| Filtros y búsqueda | **URL params** | Compartible, navegable, recargable |

> [!IMPORTANT]
> Los filtros viven en la URL. Siempre. Esto permite compartir un estado de búsqueda como link, usar el botón atrás del navegador y recuperar el contexto al recargar.

### 6.6 Reglas de importación FSD (obligatorias)

```
app      → puede importar de: pages, widgets, features, entities, shared
pages    → puede importar de: widgets, features, entities, shared
widgets  → puede importar de: features, entities, shared
features → puede importar de: entities, shared
entities → puede importar de: shared
shared   → NO importa de ninguna capa superior
```

Validado con `eslint-plugin-boundaries`. Una importación inválida bloquea el build.

### 6.7 Routing
La navegación se definirá de forma centralizada usando React Router v6+ antes de implementarse las vistas:
- `/login` - Autenticación.
- `/` (Dashboard) - Resumen financiero.
- `/accounts` - Gestión de cuentas.
- `/categories` - Gestión de categorías.
- `/transactions` - Registro e historial de transacciones.
- `/budgets` - Presupuestos y progreso.
- `/goals` - Metas financieras.

### 6.8 API Client & Authentication
Se creará un cliente HTTP único basado en Axios (`shared/api/http-client.ts`) con el siguiente flujo:
- **Base URL**: Apuntará dinámicamente a la API.
- **Auth Interceptor**: Inyectará automáticamente el token JWT Bearer (almacenado en `localStorage`) en cada petición.
- **Error Interceptor**: Capturará globalmente errores HTTP. En particular, un 401 invalida la sesión y redirige al `/login`, y los errores de validación de negocio (400) se traducen en alertas UI consistentes.
- **Protección de Rutas**: Un componente `<ProtectedRoute>` envolverá las rutas de la aplicación para interceptar usuarios no autenticados sin cargar los subcomponentes.

---

## 7. Base de Datos — Diseño de Entidades

### 7.1 Entidades principales y relaciones

```
users
  ├── 1:N → accounts
  ├── 1:N → categories
  ├── 1:N → transactions
  ├── 1:N → budgets
  ├── 1:N → goals
  ├── 1:N → tags
  ├── 1:N → audit_logs
  ├── 1:N → user_actions        ← analytics internos
  ├── 1:N → sessions
  └── 1:1 → user_settings

accounts
  ├── N:1 → users
  └── 1:N → transactions

transactions
  ├── N:1 → users
  ├── N:1 → accounts
  ├── N:1 → categories
  ├── N:M → tags                 (via transaction_tags)
  └── 1:N → attachments

categories
  ├── N:1 → users
  ├── N:1 → categories           (auto-referencia: subcategorías)
  └── 1:N → transactions

feature_flags
  └── standalone                 (sin FK a usuarios — configuración global)
```

### 7.2 Campos de auditoría universales

**Todas las entidades que pueden ser creadas, modificadas o eliminadas** incluyen estos campos:

```sql
created_at    TIMESTAMPTZ    NOT NULL  DEFAULT NOW()
created_by    UUID           FK → users  NULL (NULL = sistema/seed)
updated_at    TIMESTAMPTZ    NOT NULL
updated_by    UUID           FK → users  NULL
deleted_at    TIMESTAMPTZ    NULL       -- NULL = registro activo (Soft Delete)
deleted_by    UUID           FK → users NULL
```

### 7.3 Entidades detalladas

#### users

| Campo | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| avatar_url | VARCHAR(500) | NULL |
| role | ENUM | DEFAULT 'user' |
| is_active | BOOLEAN | DEFAULT true |
| email_verified | BOOLEAN | DEFAULT false |
| + campos auditoría | | |

#### accounts (Cuentas bancarias/billeteras)

| Campo | Tipo | Restricción | Propósito |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users | |
| name | VARCHAR(100) | NOT NULL | "Banco XYZ", "Efectivo" |
| type | ENUM | NOT NULL | CHECKING, SAVINGS, CASH, CREDIT, INVESTMENT |
| currency | CHAR(3) | DEFAULT 'USD' | ISO 4217 |
| initial_balance | DECIMAL(15,4) | DEFAULT 0 | |
| **current_balance** | DECIMAL(15,4) | NOT NULL | **Balance almacenado, no calculado** |
| color | CHAR(7) | NULL | |
| icon | VARCHAR(50) | NULL | |
| is_active | BOOLEAN | DEFAULT true | |
| + campos auditoría | | | |

**¿Por qué `current_balance` almacenado?**

Con 500,000 transacciones, hacer `SELECT SUM(amount) FROM transactions WHERE account_id = ?` en cada carga de página es costoso y lento. El balance almacenado se actualiza mediante un Domain Event (`TransactionCreated`) que dispara un handler que actualiza `accounts.current_balance` en la misma transacción de base de datos.

**Invariante crítica**: `current_balance` nunca se actualiza directamente. Solo a través del Domain Event. Esto garantiza consistencia.

**BalanceProjection — Event Sourcing Lite**: Además del `current_balance`, el sistema mantiene una tabla `balance_projections` que almacena snapshots del balance calculados desde los Domain Events. Esto no es Event Sourcing completo, pero permite:

```
balance_projections
├── account_id
├── calculated_at     ← momento del snapshot
├── balance           ← balance calculado en ese momento
├── transaction_count ← cuántas transacciones se incluyeron
└── checksum          ← hash para detectar inconsistencias

Beneficios:
→ Reconstruir el balance en cualquier punto del tiempo
→ Detectar inconsistencias entre current_balance y la realidad
→ Si se implementa Event Sourcing completo en el futuro, los datos ya están estructurados
→ Auditoría financiera: puedes demostrar cuál era el saldo en una fecha específica
```

**Reconciliación periódica**: Un job nocturno recalcula el balance real desde las transacciones y compara con el almacenado. Si hay discrepancia, loguea una alerta. Esta es la red de seguridad.

#### transactions

| Campo | Tipo | Restricción | Propósito |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users | Para queries sin joins |
| account_id | UUID | FK → accounts | |
| category_id | UUID | FK → categories | NULL permitido |
| type | ENUM | NOT NULL | INCOME, EXPENSE, TRANSFER |
| amount | DECIMAL(15,4) | NOT NULL | Siempre positivo |
| currency | CHAR(3) | NOT NULL | ISO 4217 — Money VO |
| description | VARCHAR(500) | NULL | |
| notes | TEXT | NULL | |
| date | DATE | NOT NULL | Fecha del movimiento (no created_at) |
| is_recurring | BOOLEAN | DEFAULT false | |
| recurring_rule | JSONB | NULL | iCal RRULE |
| metadata | JSONB | NULL | OCR data, IA scores, import source |
| + campos auditoría | | | |

**El campo `metadata` (JSONB)** es el campo de extensión estratégica. Cuando la IA clasifique un gasto, el resultado va en `metadata.ai_classification`. Cuando OCR procese una factura, los datos van en `metadata.ocr_result`. Cuando se importe de Excel, el row origen va en `metadata.import_source`. El schema de la tabla no cambia.

#### audit_logs

Tabla dedicada que registra todas las operaciones de escritura en el sistema:

| Campo | Tipo | Propósito |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | Quién realizó la acción |
| action | ENUM | CREATE, UPDATE, DELETE, LOGIN, LOGOUT |
| entity_type | VARCHAR(50) | 'transaction', 'budget', 'goal' |
| entity_id | UUID | ID del registro afectado |
| old_values | JSONB | Estado anterior (para DELETE y UPDATE) |
| new_values | JSONB | Estado nuevo |
| ip_address | INET | NULL |
| user_agent | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

**Caso de uso real**: "Hace 3 días eliminé una transacción de Uber por $4.80 — ¿cuándo fue exactamente y cuánto era?". Con `audit_logs`, puedes responder esa pregunta siempre, incluso después de la eliminación (soft delete lo resuelve parcialmente, pero `audit_logs` guarda también el estado previo).

**Importante**: `audit_logs` es inmutable. No tiene `deleted_at`. No tiene `UPDATE`. Solo `INSERT`.

#### user_actions (Analytics internos)

Tabla de telemetría interna para entender el comportamiento del usuario. A futuro, la IA puede aprender patrones de uso de estos datos.

| Campo | Tipo | Propósito |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| action | VARCHAR(100) | 'dashboard.viewed', 'transaction.created', 'report.exported' |
| context | JSONB | Parámetros adicionales del evento |
| created_at | TIMESTAMPTZ | |

**¿Por qué no Google Analytics o Mixpanel?** Porque son datos financieros. Los datos de comportamiento del usuario no deben salir de tu propia infraestructura.

#### sessions

| Campo | Tipo | Propósito |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| session_token_hash | VARCHAR(255) | UNIQUE — Hash del token de sesión |
| device_info | JSONB | User agent, plataforma |
| ip_address | INET | |
| expires_at | TIMESTAMPTZ | |
| revoked_at | TIMESTAMPTZ | NULL = activa |
| created_at | TIMESTAMPTZ | |

#### feature_flags

| Campo | Tipo | Propósito |
|---|---|---|
| id | UUID | PK |
| key | VARCHAR(100) | UNIQUE — 'feature.ocr', 'feature.ai', 'feature.offline' |
| enabled | BOOLEAN | DEFAULT false |
| description | TEXT | Para el equipo de desarrollo |
| rollout_percentage | INTEGER | 0-100, para rollout gradual futuro |
| updated_at | TIMESTAMPTZ | |

### 7.4 Índices críticos

```sql
-- Queries más frecuentes del sistema
CREATE INDEX idx_transactions_user_date     ON transactions (user_id, date DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_transactions_user_account  ON transactions (user_id, account_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_transactions_user_category ON transactions (user_id, category_id)
  WHERE deleted_at IS NULL;

-- Partial index: solo registros activos (ignora soft-deleted)
-- Esto mantiene el índice pequeño y eficiente

-- Full-text search para buscador avanzado
CREATE INDEX idx_transactions_fts ON transactions
  USING gin(to_tsvector('spanish',
    coalesce(description,'') || ' ' || coalesce(notes,'')));

-- Auditoría
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_user   ON audit_logs (user_id, created_at DESC);

-- Sesiones activas
CREATE INDEX idx_sessions_active ON sessions (user_id, expires_at)
  WHERE revoked_at IS NULL;
```

> [!TIP]
> Los índices parciales (`WHERE deleted_at IS NULL`) son un patrón crítico con soft delete. Sin ellos, el índice incluye todos los registros eliminados, haciéndolo más grande y más lento. Con ellos, solo indexas los registros que realmente se consultan.

---

## 8. Seguridad y Autenticación

### 8.1 Estrategia: Sessions con HttpOnly Cookie (no JWT)

**Decisión revisada en Architecture Review**: No usar JWT + Refresh Token desde el día 1.

**Justificación**: JWT resuelve problemas de escala stateless y API pública. Este sistema tiene un usuario, no tiene API pública, y no tiene OAuth. La complejidad de JWT + Refresh Token Rotation es innecesaria hasta que alguno de esos problemas exista.

#### Flujo de sesión

```
Login
  ↓
Verificar credenciales
  ↓
Crear registro en tabla `sessions`
  ↓
Generar session token (crypto.randomBytes(32) → hex)
  ↓
Hashear token con SHA-256 → guardar en DB
  ↓
Enviar token original en HttpOnly Cookie (SameSite=Strict, Secure)
  ↓

Cada request autenticado:
  ↓
Leer cookie → extraer token
  ↓
Hashear → buscar en DB
  ↓
Verificar expires_at y revoked_at
  ↓
Inyectar user en contexto
```

**¿Por qué no el token directamente en la base de datos?** Si la DB es comprometida, los tokens hasheados no sirven de nada al atacante (mismo principio que las contraseñas).

**Cuando migrar a JWT**: Cuando se implemente la API pública o se necesite OAuth. En ese momento, los endpoints de API pública usan JWT; los endpoints web siguen usando sessions. No es un cambio de todo o nada.

### 8.2 Configuración de seguridad HTTP

```
Headers de seguridad (Helmet.js):
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

CORS:
- Whitelist de origins en variable de entorno
- Sin wildcards en producción

Cookie flags:
- HttpOnly: true         ← no accesible desde JavaScript
- Secure: true           ← solo HTTPS
- SameSite: Strict       ← protección CSRF incluida
- Path: /api             ← no enviada en assets estáticos
```

### 8.3 Hash de contraseñas

- **bcrypt** con work factor 12 mínimo
- Validación en registro: mínimo 8 caracteres, al menos un número y un carácter especial
- Rate limiting de 10 req/min en endpoints de auth

### 8.4 Roles y permisos

```
SUPER_ADMIN → acceso total
ADMIN       → administración de usuarios
USER        → acceso solo a sus propios datos
VIEWER      → read-only (para compartir con contador futuro)
```

Cada query de datos personales incluye `WHERE user_id = currentUser.id`. Preparado para PostgreSQL RLS en el futuro.

### 8.5 Auditoría de seguridad

```
Se loguea siempre:
- Todos los intentos de login (exitosos y fallidos)
- Logout y revocación de sesión
- Operaciones CRUD en transacciones y cuentas
- Cambios en configuración
- Rate limit alcanzado

Nunca se loguea:
- Passwords (ni en texto plano ni en hash)
- Session tokens completos
- Datos sensibles de tarjetas
```

---

## 9. Domain Events y Event Bus

### 9.1 Justificación

Sin Domain Events, el Use Case de crear una transacción tendría que:

1. Crear la transacción
2. Actualizar el saldo de la cuenta
3. Verificar si se superó el presupuesto
4. Invalidar el cache del dashboard
5. Registrar en analytics
6. En el futuro: enviar a la IA, disparar notificación

Ese Use Case violaría SRP y cada nueva funcionalidad lo haría más grande. Con Domain Events:

1. Use Case crea la transacción
2. Publica `TransactionCreated`
3. Cada handler reacciona de forma independiente

### 9.2 Implementación en proceso (sin RabbitMQ)

```
Fase 1 (ahora): EventEmitter2 en proceso
  - Sin latencia de red
  - Sin configuración de infraestructura
  - Síncrono dentro de la misma transacción de DB (para consistencia)
  - Async para operaciones que pueden fallar sin afectar el resultado principal

Fase 2 (cuando escale): BullMQ con Redis
  - Jobs en cola, retry automático
  - Dashboard de workers

Fase 3 (microservicios): RabbitMQ o Kafka
  - Eventos entre servicios independientes
```

### 9.3 Domain Events del sistema

```typescript
// Catálogo de Domain Events

// Transacciones
TransactionCreated   → { transactionId, userId, accountId, amount, type, date }
TransactionUpdated   → { transactionId, userId, previousAmount, newAmount }
TransactionDeleted   → { transactionId, userId, accountId, amount, type }

// Cuentas
AccountCreated       → { accountId, userId, initialBalance }
AccountBalanceChanged → { accountId, userId, previousBalance, newBalance }

// Presupuestos
BudgetThresholdReached → { budgetId, userId, categoryId, percentage }
BudgetExceeded         → { budgetId, userId, categoryId }

// Metas
GoalProgressUpdated  → { goalId, userId, currentAmount, targetAmount, percentage }
GoalCompleted        → { goalId, userId }
```

### 9.4 Handler: UpdateAccountBalance

```
TransactionCreated
  → UpdateAccountBalanceHandler
    → accounts.current_balance += transaction.amount (INCOME)
    → accounts.current_balance -= transaction.amount (EXPENSE)
    → (atómico con la creación de la transacción)
```

---

## 10. Feature Flags

### 10.1 Propósito

Los feature flags permiten activar o desactivar funcionalidades sin hacer un deploy. Esto es crítico para:

- Activar OCR cuando esté listo sin afectar el resto del sistema
- Habilitar offline sync para pruebas antes del rollout general
- Desactivar una feature que introduce un bug en producción en segundos

### 10.2 Implementación

La tabla `feature_flags` en base de datos es la fuente de verdad. Se cachea en memoria con TTL de 5 minutos.

```
feature.ocr              → false (por defecto)
feature.ai_classification → false
feature.offline_sync     → false
feature.excel_import     → false
feature.pdf_export       → false
feature.public_api       → false
feature.budget_alerts    → true   (activado desde el inicio)
```

### 10.3 Uso en backend (Guard)

```
@FeatureFlag('feature.ocr')   → 503 Feature Not Available si está desactivado
```

### 10.4 Uso en frontend (Hook)

```
const { isEnabled } = useFeatureFlag('feature.ocr')
// Oculta el botón de OCR si la feature está desactivada
// No lanza error — simplemente no muestra la UI
```

---

## 11. Observabilidad

La observabilidad no es monitoreo reactivo — es la capacidad de entender el estado interno del sistema mirando sus salidas. Se implementa por capas:

### 11.1 Health Checks

```
GET /api/health                    ← Estado general del sistema
  └── database: ✔/✖              Base de datos accesible
  └── cache: ✔/✖                 Cache operativo
  └── storage: ✔/✖              Storage de archivos accesible
  └── uptime: 3600s
  └── version: "1.0.0"

GET /api/health/ready              ← Listo para recibir tráfico (Kubernetes readiness)
GET /api/health/live               ← El proceso está vivo (Kubernetes liveness)
```

Implementado con `@nestjs/terminus`. Railway y Vercel usan el endpoint `/api/health` para verificar que el deploy fue exitoso.

### 11.2 Métricas

Por ahora: logs estructurados que Railway/Render capturan. Cuando escale:

```
Prometheus metrics en /api/metrics:
- http_request_duration_seconds (histogram)
- http_requests_total (counter por ruta, método, status)
- active_sessions_total (gauge)
- transactions_created_total (counter)
- db_query_duration_seconds (histogram)
```

El módulo de métricas existe desde el día 1 pero retorna un placeholder hasta que se configure Prometheus.

### 11.3 Tracing

Cada request recibe un `X-Request-ID` único (generado en el middleware si no viene en el header). Este ID se propaga en:
- Todos los logs del request
- La respuesta HTTP (para correlación desde el frontend)
- Los Domain Events generados durante el request

Cuando escale: OpenTelemetry con Jaeger o Honeycomb.

### 11.4 Logging estructurado (Pino)

```json
{
  "level": "info",
  "time": "2026-07-28T21:00:00Z",
  "requestId": "abc-123",
  "userId": "uuid-user",
  "module": "transactions",
  "action": "create",
  "duration": 45,
  "statusCode": 201
}
```

Nunca strings de log libre. Siempre objetos estructurados. Esto permite filtrar y agregar en Railway, Datadog, o cualquier herramienta de logs.

---

## 12. Error Codes del Dominio

En lugar de solo códigos HTTP genéricos, el sistema tiene un catálogo de error codes internos. Esto permite que el frontend, los logs y la IA sepan exactamente qué ocurrió.

### 12.1 Formato

```json
{
  "success": false,
  "error": {
    "code": "TRX_003",
    "message": "El monto de la transacción debe ser mayor a cero",
    "httpStatus": 400,
    "field": "amount"
  },
  "timestamp": "2026-07-28T21:00:00Z"
}
```

### 12.2 Catálogo de error codes

| Código | Módulo | Descripción | HTTP |
|---|---|---|---|
| **AUTH_001** | Auth | Credenciales inválidas | 401 |
| **AUTH_002** | Auth | Sesión expirada | 401 |
| **AUTH_003** | Auth | Sesión revocada | 401 |
| **AUTH_004** | Auth | Demasiados intentos de login | 429 |
| **USR_001** | Users | Usuario no encontrado | 404 |
| **USR_002** | Users | Email ya registrado | 409 |
| **ACC_001** | Accounts | Cuenta no encontrada | 404 |
| **ACC_002** | Accounts | No se puede eliminar cuenta con transacciones | 409 |
| **ACC_003** | Accounts | Moneda inválida (no es ISO 4217) | 400 |
| **TRX_001** | Transactions | Transacción no encontrada | 404 |
| **TRX_002** | Transactions | Cuenta origen y destino son iguales en transferencia | 400 |
| **TRX_003** | Transactions | El monto debe ser mayor a cero | 400 |
| **TRX_004** | Transactions | Fecha futura no permitida | 400 |
| **TRX_005** | Transactions | Categoría no compatible con el tipo de transacción | 400 |
| **CAT_001** | Categories | Categoría no encontrada | 404 |
| **CAT_002** | Categories | No se puede eliminar categoría del sistema | 409 |
| **CAT_003** | Categories | No se puede eliminar categoría con transacciones | 409 |
| **BGT_001** | Budgets | Presupuesto no encontrado | 404 |
| **BGT_002** | Budgets | El monto del presupuesto debe ser mayor a cero | 400 |
| **BGT_003** | Budgets | Ya existe un presupuesto activo para esa categoría y período | 409 |
| **GOL_001** | Goals | Meta no encontrada | 404 |
| **GOL_002** | Goals | La fecha objetivo no puede ser anterior a hoy | 400 |
| **GOL_003** | Goals | El monto objetivo debe ser mayor a cero | 400 |
| **SYS_001** | System | Error interno del servidor | 500 |
| **SYS_002** | System | Feature no disponible (Feature Flag) | 503 |
| **SYS_003** | System | Rate limit excedido | 429 |

### 12.3 Beneficios

- **Frontend**: muestra mensajes específicos, no genéricos
- **Logs**: filtrar `code: TRX_003` identifica inmediatamente el problema
- **IA futura**: puede categorizar errores y sugerir soluciones
- **API pública**: los consumidores manejan errores por código, no por mensaje (los mensajes pueden cambiar de idioma)

---

## 13. Calidad del Código

### 11.1 Principios aplicados

| Principio | Aplicación concreta |
|---|---|
| **SRP** | Un Use Case = una operación. Un Service = un dominio |
| **OCP** | Nuevos providers de IA = nueva implementación de `IAIProvider` |
| **LSP** | Todas las implementaciones de repositorios son intercambiables |
| **ISP** | Interfaces de repositorio separadas por operación si es necesario |
| **DIP** | Use Cases dependen de `ITransactionRepository`, no de `PrismaTransactionRepository` |
| **DRY** | Schema Zod en `packages/shared` — una sola fuente de verdad |
| **KISS** | No sobre-abstraer hasta que el patrón se repita 3 veces |
| **YAGNI** | No implementar cache distribuido hasta que sea necesario |

### 11.2 Herramientas de calidad

```
ESLint:
- @typescript-eslint (strict)
- eslint-plugin-boundaries (reglas FSD)
- eslint-plugin-import (orden de imports)

Prettier: formateo en pre-commit (Husky + lint-staged)

TypeScript:
- strict: true
- noImplicitAny: true
- strictNullChecks: true
- noUncheckedIndexedAccess: true

Commitlint: Conventional Commits obligatorio en CI
```

### 11.3 Convenciones de nomenclatura

```
Backend:
- Interfaces:   ITransactionRepository    (prefijo I)
- DTOs:         CreateTransactionDto      (sufijo Dto)
- Use Cases:    CreateTransactionUseCase  (sufijo UseCase)
- Events:       TransactionCreatedEvent   (sufijo Event)
- Handlers:     UpdateBudgetOnTransactionHandler (sufijo Handler)
- Entities:     Transaction               (sin sufijo)

Frontend:
- Hooks:        useTransactions           (prefijo use)
- Queries:      useTransactionsQuery      (sufijo Query)
- Mutations:    useCreateTransactionMutation (sufijo Mutation)
- Components:   TransactionRow            (PascalCase)
- Pages:        DashboardPage             (sufijo Page)

Commits (Conventional Commits):
- feat: nueva funcionalidad
- fix: corrección de bug
- refactor: sin cambio de comportamiento
- docs: documentación
- test: agregar o modificar tests
- chore: mantenimiento
- perf: mejoras de rendimiento
```

---

## 12. Estrategia de Testing

### 12.1 Pirámide de testing

```
         /\
        /E2E\          ← Playwright (5-10 flujos críticos)
       /──────\
      /Integr. \       ← Jest + Supertest (endpoints críticos)
     /────────────\
    /  Unit Tests  \   ← Jest (domain, use cases, utils, componentes)
   /────────────────\
```

### 12.2 Unit Tests

```
✅ Entidades de dominio (lógica de negocio pura)
✅ Value Objects (Money, Currency validations)
✅ Use Cases (repositorios mockeados)
✅ Event Handlers (event bus mockeado)
✅ Utilities y helpers
✅ Componentes React (React Testing Library)
✅ Custom hooks

❌ Repositories (son integración, no unit)
❌ Controllers (son integración)
```

Cobertura mínima obligatoria: **80% en dominio y aplicación**.

### 12.3 Integration Tests

```
Tests de integración cubren:
- POST /api/auth/login → cookie de sesión creada
- POST /api/transactions → transacción creada + balance de cuenta actualizado
- GET /api/transactions → paginación y filtros correctos
- GET /api/dashboard/summary → cálculos correctos
- DELETE /api/transactions/:id → soft delete, audit_log creado
```

Usan PostgreSQL real en Docker. `beforeEach` hace rollback de transacción para aislamiento.

### 12.4 E2E Tests (Playwright)

```
Flujos críticos (siempre deben funcionar):
1. Login → Ver Dashboard → Cerrar sesión
2. Crear transacción → Verificar en historial → Verificar balance de cuenta
3. Crear presupuesto → Agregar gasto → Ver progreso del presupuesto
4. Filtrar transacciones por categoría y rango de fecha
5. Eliminar transacción → Verificar que sigue accesible en audit log
```

---

## 13. DevOps y CI/CD

### 13.1 Docker

```yaml
Archivos:
- docker-compose.yml           # Desarrollo local (API + DB + Redis opcional)
- docker-compose.test.yml      # Tests de integración y E2E
- apps/api/Dockerfile          # Multi-stage: builder → runner
```

**Multi-stage Dockerfile**:
```
Stage 1 (builder): Node full + todas las dependencias → tsc compile
Stage 2 (runner):  Node slim + dist/ + prod node_modules
Imagen final: ~150MB
```

### 13.2 Variables de entorno

```
.env.example → versionado en Git (sin valores)
.env          → NO versionado (.gitignore)
.env.test     → para tests locales

Validación obligatoria al arranque:
- Config Service valida todas las variables con Zod
- Si falta DATABASE_URL → crash inmediato, error claro
- Nunca: valores hardcodeados, nunca falla silenciosamente
```

### 13.3 Pipeline CI/CD (GitHub Actions)

```yaml
En cada PR:
  → Lint (ESLint + Prettier check)
  → Type Check (tsc --noEmit)
  → Unit Tests
  → Integration Tests (Postgres Docker)
  → Build
  → [Bloqueante] Convencional Commits check

En merge a main:
  → Todo lo anterior
  → prisma migrate deploy
  → Deploy API → Railway
  → Deploy Web → Vercel
```

### 13.4 Migraciones Prisma — Reglas absolutas

```
✅ prisma migrate dev        → solo en desarrollo local
✅ prisma migrate deploy     → solo en CI/CD, antes del deploy
✅ Migraciones zero-downtime → columna nullable → deploy → backfill → NOT NULL
❌ prisma db push            → NUNCA en producción
❌ Renombrar columna directamente → SIEMPRE: nueva columna → migrar → eliminar vieja
```

### 13.5 Git Flow

```
main     → producción (protegido, require PR + CI verde)
develop  → integración (merge a main via PR)
feature/ → features nuevas (merge a develop)
fix/     → bugfixes
chore/   → mantenimiento

Versionado: Semantic Versioning (semver)
1.0.0 → primera versión estable
1.1.0 → nuevas funcionalidades sin breaking changes
2.0.0 → breaking changes de API
```

---

## 14. Escalabilidad

### 14.1 Camino de escalabilidad

```
Fase 1: Monolith (actual)
  └── Un proceso NestJS, EventEmitter2 en proceso

Fase 2: Monolith + Read Replicas + BullMQ
  └── Queries de solo lectura → réplica de PostgreSQL
  └── Jobs asincrónicos → BullMQ + Redis
  └── Sin cambio de código de dominio

Fase 3: Módulos separados (si se necesita)
  └── Módulo de Reports → microservicio independiente
  └── Módulo de IA → servicio Python (scikit-learn, PyTorch)

Fase 4: Microservicios completos
  └── Event-driven con RabbitMQ o Kafka
  └── Cada módulo con su propia base de datos
```

### 14.2 Preparación para features futuras

| Feature futura | Preparación actual |
|---|---|
| **IA clasificación** | `metadata JSONB` en transactions. `integrations/ai/` con interface |
| **Múltiples providers IA** | `IAIProvider` interface. OpenAI/Anthropic/DeepSeek son adaptadores |
| **OCR de facturas** | Tabla `attachments` con `ocr_status` y `ocr_result JSONB`. Feature flag |
| **Importación Excel/CSV** | `integrations/imports/` con patrón Strategy. Agregar strategy sin cambiar interface |
| **Exportación PDF/Excel** | `integrations/exports/` con patrón Strategy |
| **Offline/PWA** | `StorageProvider` interface. `IndexedDBStorageProvider` se agrega sin cambiar apps |
| **Notificaciones** | Domain Events ya existen. Agregar `NotificationHandler` sin tocar `Transaction` |
| **API pública** | Versionado `/api/v1/`. OpenAPI spec desde decoradores NestJS. JWT en ese momento |
| **Integración bancaria** | `integrations/bank/` como strategy de importación |
| **Multi-moneda** | `currency CHAR(3)` en accounts y transactions desde el inicio. Money VO listo |
| **Predicción de gastos** | `user_actions` + `metadata` proveen los datos. Modelo de IA los consume |

---

## 15. Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| **Inconsistencia de `current_balance`** | Media | Alto | Job de reconciliación nocturno + transacciones atómicas |
| **Railway Free agota créditos** | Media | Medio | Migrar a $5/mes plan. Docker facilita la migración |
| **Neon Free 512MB alcanzado** | Baja | Alto | Índices parciales. Archivado de datos viejos. Monitoreo |
| **Domain Events fallan silenciosamente** | Media | Alto | Implementar Dead Letter Queue desde el inicio para eventos críticos |
| **Soft delete llena las tablas** | Baja | Bajo | Job de archivado que mueve a tabla `_archive` después de X años |
| **Bundle frontend crece** | Baja | Bajo | Code splitting por ruta. Lazy loading de charts. Bundle analyzer |
| **Cookie de sesión no llega en CORS** | Alta (desarrollo) | Bajo | `credentials: 'include'` en fetch + `withCredentials` en Axios |

### Deuda técnica planificada (aceptable hoy)

```
Aceptado ahora, resolver cuando sea necesario:
- In-memory cache (no Redis)
- Sin message queue externa (EventEmitter2)
- Service Worker básico (no full offline)
- Balance de cuenta actualizado síncronamente (no event sourcing completo)
```

---

## 16. ADRs — Architecture Decision Records

Cada decisión arquitectónica importante tiene su ADR en `docs/architecture/ADR/`.

**Formato estándar de un ADR**:

```markdown
# ADR-XXX: [Título de la decisión]

**Estado**: Accepted | Proposed | Deprecated | Superseded
**Fecha**: YYYY-MM-DD
**Decisores**: [Quién tomó la decisión]

## Contexto
[Por qué se necesitaba tomar esta decisión]

## Opciones consideradas
1. Opción A — pros/cons
2. Opción B — pros/cons

## Decisión
[Qué se eligió y por qué]

## Consecuencias
[Qué implica esta decisión a largo plazo]
[Qué puertas cierra, cuáles abre]
```

### ADRs iniciales requeridos

| ADR | Decisión | Estado |
|---|---|---|
| ADR-001 | Por qué NestJS sobre Express/Fastify | Accepted |
| ADR-002 | Por qué Prisma sobre TypeORM/MikroORM | Accepted |
| ADR-003 | Por qué PostgreSQL sobre MongoDB | Accepted |
| ADR-004 | Por qué Feature-Sliced Design en el frontend | Accepted |
| ADR-005 | Por qué Railway sobre Render | Accepted |
| ADR-006 | Por qué PWA sobre app nativa | Accepted |
| ADR-007 | Por qué Sessions sobre JWT inicialmente | Accepted |
| ADR-008 | Por qué Turborepo (Monorepo) | Accepted |
| ADR-009 | Por qué Soft Delete universal | Accepted |
| ADR-010 | Por qué Domain Events internos desde el inicio | Accepted |

> [!NOTE]
> Los ADRs no se actualizan — se deprecan y se crea uno nuevo. Esto preserva el historial completo de decisiones. En 2 años, siempre sabrás qué se decidió, cuándo, y por qué.

---

## 17. Roadmap Técnico

### Fase 0 — Los 6 documentos (Antes del código)

```
[ ] Documento 1: Arquitectura (este documento) ✅
[ ] Documento 2: Modelo de dominio — reglas de negocio e invariantes
[ ] Documento 3: ERD — diagrama de entidades y relaciones
[ ] Documento 4: Contratos de API (OpenAPI spec)
[ ] Documento 5: Design System — tokens, componentes, tipografía
[ ] Documento 6: Roadmap funcional — features ordenadas por valor
```

### Fase 1 — Fundación técnica (Semanas 1-2)

```
[ ] Monorepo Turborepo + packages/ configurados
[ ] Backend: NestJS + Prisma + PostgreSQL + Auth (Sessions)
[ ] Frontend: Vite + React + TailwindCSS + Router + TanStack Query
[ ] packages/shared: schemas Zod iniciales
[ ] packages/ui: componentes base (Button, Input, Card, Modal)
[ ] CI/CD básico (lint + test + build)
[ ] ADRs escritos para las decisiones iniciales
```

### Fase 2 — Core MVP (Semanas 3-6)

```
[ ] Módulo de cuentas (con current_balance y Domain Events)
[ ] Módulo de categorías (sistema + personalizadas)
[ ] Módulo de transacciones (CRUD + soft delete + audit)
[ ] Dashboard básico (saldo total, gastos/ingresos del mes)
[ ] Historial con filtros y paginación
[ ] Buscador avanzado (full-text search)
[ ] StorageProvider interface implementada
```

### Fase 3 — Funcionalidades Financieras (Semanas 7-10)

```
[ ] Módulo de presupuestos (con alertas via Domain Events)
[ ] Módulo de metas de ahorro
[ ] Reportes (mensual, anual)
[ ] Gráficos (Recharts)
[ ] Estadísticas
[ ] Filtros avanzados
[ ] Feature flags operativos
```

### Fase 4 — Calidad y PWA (Semanas 11-12)

```
[ ] Test coverage 80% en dominio
[ ] E2E tests para 5 flujos críticos
[ ] Optimización de performance
[ ] PWA: manifest + service worker básico (Workbox)
[ ] OpenAPI/Swagger completo
[ ] user_actions analytics activado
```

### Fase 5+ — Features avanzadas

```
[ ] integrations/imports: Excel, CSV
[ ] integrations/exports: PDF, Excel
[ ] Adjuntar imágenes (attachments)
[ ] OCR de recibos (activar feature flag)
[ ] IA clasificación automática
[ ] Notificaciones y recordatorios
[ ] Sincronización offline completa (IndexedDBStorageProvider)
[ ] API pública + JWT
```

---

## 18. Decisiones Irrompibles

> [!CAUTION]
> Estas reglas NO se rompen. Si parece conveniente romperlas, es señal de deuda técnica acumulada. La solución es revisar el diseño, no saltarse la regla.

### Las 20 reglas de oro

1. **El dominio no importa Prisma. Nunca.** Las entidades de dominio son TypeScript puro. Esto garantiza testabilidad y reemplazabilidad.

2. **Los Use Cases no conocen HTTP.** No importan `Request`, `Response` ni `HttpException`. Si un use case necesita saber que está en HTTP, el diseño está mal.

3. **Los errores de Prisma no llegan al dominio.** El repositorio convierte `PrismaClientKnownRequestError` en `DomainException` antes de propagarla.

4. **Nunca usar `any` en TypeScript.** `unknown` si es necesario, tipado correctamente. `any` es deuda técnica invisible que genera bugs en producción.

5. **Los tests del dominio nunca tocan base de datos.** Repositorios mockeados con interfaces. Un test que necesita una BD no es un unit test.

6. **Nunca `prisma db push` en producción.** Solo `prisma migrate deploy`. Sin excepciones.

7. **Todos los queries de datos personales incluyen `user_id`.** Ningún query de datos financieros puede ejecutarse sin scoping por usuario.

8. **Las cookies de sesión son HttpOnly y SameSite=Strict.** Sin excepciones. El session token no es accesible desde JavaScript.

9. **La lógica de negocio no vive en los Controllers.** Los controllers: validan entrada → llaman use case → transforman salida. Nada más.

10. **Las rutas son constantes tipadas.** `ROUTES.TRANSACTIONS.LIST` nunca `/transactions`. Si la ruta cambia, cambia en un lugar.

11. **Los imports respetan las capas de FSD.** `features` no importa de `pages`. `shared` no importa de `features`. ESLint lo hace obligatorio.

12. **El estado del servidor no vive en Zustand.** TanStack Query es la fuente de verdad para datos remotos. Zustand solo para UI state puro.

13. **Las migraciones son siempre backward-compatible.** Agregar → migrar → limpiar. Nunca renombrar o eliminar directamente.

14. **Las variables de entorno se validan al arrancar.** Si falta una variable crítica, el servidor no arranca. Jamás falla silenciosamente en runtime.

15. **Cada módulo tiene `domain/`, `application/` e `infrastructure/`.** La separación de capas es por módulo. Esto permite extraer módulos como microservicios.

16. **`current_balance` solo se actualiza via Domain Events.** Nunca directamente desde el Use Case de transacciones. Esto garantiza la invariante de consistencia.

17. **Soft delete universal.** Las entidades no se eliminan físicamente. `deleted_at` es la única forma de "eliminar". Los queries siempre filtran `WHERE deleted_at IS NULL`.

18. **Domain Events siempre.** Si una acción en un módulo necesita afectar otro módulo, la comunicación es via Domain Event. Nunca llamadas directas entre módulos.

19. **`metadata JSONB` es el campo de extensión.** Datos de IA, OCR, importaciones y cualquier dato no estructurado van en `metadata`. El schema de la tabla no se modifica para estas extensiones.

20. **Un ADR por cada decisión arquitectónica significativa.** Antes de cambiar la tecnología, el patrón o la estructura: escribe el ADR. Esto preserva el "por qué" del sistema durante años.

---

## Appendix A — Tecnologías de apoyo

| Categoría | Tecnología | Alternativa |
|---|---|---|
| Charts | Recharts | Nivo, Chart.js |
| Dates | date-fns | dayjs |
| Icons | Lucide React | Heroicons |
| Animations | Framer Motion | CSS animations |
| Toast | Sonner | React-Hot-Toast |
| Tables | TanStack Table v8 | — |
| Virtual lists | TanStack Virtual | react-window |
| Decimal aritmética | **big.js** | decimal.js (más pesado, innecesario) |
| PDF (futuro) | React-PDF | Puppeteer |
| OCR (futuro) | Tesseract.js | Google Vision API |
| IA (futuro) | Vercel AI SDK | LangChain.js |
| Event emitter | EventEmitter2 | @nestjs/event-emitter |
| Jobs (futuro) | BullMQ + Redis | — |

---

*Este documento es el artefacto oficial de arquitectura. Debe actualizarse al tomar decisiones arquitectónicas significativas. Cada actualización requiere un nuevo ADR que registre el cambio y su justificación.*

*Versión 2.1 — DOCUMENTO DEFINITIVO — Julio 2026*

---

## Appendix B — packages/sdk: El Cliente API Type-Safe

Este es uno de los cambios más impactantes en la experiencia de desarrollo.

**Sin `packages/sdk`**, el frontend escribe esto:

```typescript
// Propenso a errores: la URL, el tipo, los parámetros son strings libres
const response = await axios.post('/api/v1/transactions', { amount: 100, ... })
const data = response.data as CreateTransactionResponse  // cast manual
```

**Con `packages/sdk`**, el frontend escribe esto:

```typescript
// Type-safe: el IDE autocompletea, el compilador verifica
const transaction = await api.transactions.create({ amount: 100, ... })
// transaction es Transaction automáticamente
```

**¿Cómo funciona?** El backend genera `openapi.json` automáticamente con NestJS + `@nestjs/swagger`. El CI/CD ejecuta `openapi-typescript-codegen` sobre ese archivo y genera `packages/sdk/src/resources/`. El frontend importa del SDK y nunca escribe URLs o tipos manuales.

**Beneficio crítico**: Si un DTO cambia en el backend y el frontend no actualizó el SDK, **el build del frontend falla**. El error se detecta en CI/CD, no en producción.

```
Flujo:
NestJS decoradores → openapi.json → openapi-typescript-codegen → packages/sdk
                                                                        ↓
                                                              apps/web import
```

---

## Appendix C — Documento 2: Business Rules (Preview)

> [!NOTE]
> Este es el preview de lo que contendrá `docs/02-business-rules.md`. Se desarrolla completamente en el siguiente documento.

### Invariantes del sistema financiero

**Transacciones**
- Una transacción nunca puede tener monto negativo ni cero
- El tipo (INCOME/EXPENSE/TRANSFER) no puede modificarse después de creada
- Una transferencia siempre crea exactamente dos movimientos: uno de salida y uno de entrada
- Una transacción no puede tener fecha futura mayor a 7 días (previene errores de digitación)
- Una transacción eliminada nunca desaparece del sistema (soft delete + audit log)

**Cuentas**
- Una cuenta no puede eliminarse si tiene transacciones asociadas
- El balance nunca se modifica manualmente — solo a través de Domain Events
- Dos cuentas del mismo usuario pueden tener monedas diferentes
- El balance inicial de una cuenta es inmutable después de la primera transacción

**Categorías**
- Las categorías del sistema (is_system = true) no pueden eliminarse ni modificarse
- Una categoría con transacciones asociadas no puede eliminarse
- Una subcategoría siempre hereda el tipo (INCOME/EXPENSE) de su padre
- La profundidad máxima de subcategorías es 2 niveles

**Presupuestos**
- El monto de un presupuesto debe ser mayor a cero
- No puede existir más de un presupuesto activo para la misma categoría y período
- Un presupuesto no puede tener fecha de fin anterior a su fecha de inicio
- Cuando se elimina una categoría, sus presupuestos se desactivan (no eliminan)

**Metas de ahorro**
- El monto objetivo debe ser mayor a cero
- La fecha objetivo no puede ser anterior al día de creación
- El monto actual nunca puede superar el monto objetivo
- Una meta completada no puede volver al estado activo

**Seguridad**
- Un usuario solo puede acceder a sus propios datos (nunca datos de otro usuario)
- La sesión expira después de [configurable] días de inactividad
- Después de 10 intentos fallidos de login, el acceso se bloquea temporalmente

> [!IMPORTANT]
> Estas reglas son **invariantes del dominio**, no validaciones de formulario. Deben implementarse en la capa de **dominio** (entidades), no en controllers ni servicios. Si una entidad puede violar estas reglas, el sistema está mal diseñado.
