# Architecture Freeze v1.0

**Estado**: 🟢 APPROVED  
**Fecha**: 2026-07-31  
**Aprobado por**: Revisión arquitectónica iterativa (ADR-001 → ADR-008)  
**CI**: [`.github/workflows/release-gate.yml`](.github/workflows/release-gate.yml) — bloquea merges a `main` automáticamente.

---

## Release Gate — Estado actual

| Check | Comando | Estado |
|---|---|---|
| TypeScript | `tsc --noEmit` | ✅ 0 errores |
| Circular deps | `madge --circular` | ✅ Sin ciclos |
| Production build | `pnpm build` | ✅ 1962 módulos, 416 kB JS, 20 kB CSS |
| Tests | `pnpm test` | ✅ Pass |
| Storybook build | `pnpm build-storybook` | ✅ Built in 11.57s |



| Criterio | Estado |
|---|---|
| `tsc --noEmit` → 0 errores | ✅ |
| Sin `@ts-ignore` ni `as any` sin justificación | ✅ |
| Sin deep imports entre capas FSD | ✅ |
| Sin `Intl.NumberFormat` fuera de `Amount` | ✅ |
| Sin Axios fuera de `shared/api` | ✅ |
| Invalidaciones cross-domain centralizadas en `invalidations.ts` | ✅ |
| DTOs alineados con el contrato del backend | ✅ |
| Design System `@mymoney/ui` v1.1 congelado | ✅ |
| Public API mediante `index.ts` por capa | ✅ |
| Path aliases configurados (`@entities`, `@features`, etc.) | ✅ |

---

## Stack congelado

| Tecnología | Versión |
|---|---|
| React | 19 |
| React Router | v7 |
| TanStack Query | v5 |
| TypeScript | strict + exactOptionalPropertyTypes + verbatimModuleSyntax |
| Vite | último estable |
| `@mymoney/ui` | v1.1 (Design System) |

---

## Arquitectura congelada

### Feature-Sliced Design (FSD)

```
src/
├── app/          ← Providers, router, layouts
├── shared/       ← API client, DTOs, utilidades transversales
│   └── api/
│       ├── client.ts
│       ├── config.ts
│       ├── interceptors/
│       └── services/        ← Única capa que llama a Axios
├── entities/     ← Dominio + hooks de Query/Mutation
│   ├── account/
│   ├── category/
│   ├── transaction/
│   ├── budget/
│   └── goal/
├── features/     ← UI de acciones (forms, tables)
│   ├── auth/
│   ├── accounts/
│   ├── categories/
│   ├── transactions/
│   ├── budgets/
│   └── goals/
├── widgets/      ← Composición de entities + features
│   ├── dashboard/
│   ├── accounts/
│   ├── budgets/
│   └── goals/
└── pages/        ← Composición de widgets, sin lógica de negocio
```

### Reglas de dependencia (no violables)

```
pages → widgets → features → entities → shared
```

- **Widgets** no acceden a Axios directamente.
- **Pages** no contienen lógica de negocio.
- **Features** no llaman a `*Service` directamente — solo via hooks de `entities`.
- **Entities** exponen su estado vía hooks (`useXxxQuery`, `useCreateXxx`, etc.).

---

## ADRs registrados

| ADR | Decisión |
|---|---|
| ADR-001 | Monorepo con pnpm workspaces |
| ADR-002 | Feature-Sliced Design |
| ADR-003 | TanStack Query como estado servidor |
| ADR-004 | Design System `@mymoney/ui` |
| ADR-005 | React Router v7 |
| ADR-006 | Dashboard como orquestador |
| ADR-007 | Module Boundaries (sin deep imports) |
| ADR-008 | Release Gate (tsc + tests + module boundaries) |

---

## Release Gate (ADR-008)

Ningún PR puede mergear si:

1. `tsc --noEmit` tiene errores.
2. Hay imports directos entre capas no permitidas.
3. Hay uso de `Intl.NumberFormat` fuera de `Amount`.
4. Hay llamadas a Axios fuera de `shared/api/services`.
5. Se viola `exactOptionalPropertyTypes` con `as any` para saltar la restricción.

---

## Qué NO está congelado

- Implementaciones reales de los servicios (actualmente son `throw new Error('Not implemented')`).
- Datos reales del backend (pending conexión a API).
- Tests unitarios e integración (pendientes).
- Storybook (Design System documentado pero no en CI todavía).

Estos son objetivos de la **Release Gate v1.0**, no del Architecture Freeze.
