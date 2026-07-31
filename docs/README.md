# MyMoney — Documentación del Proyecto

> Control de documentos de diseño — 7 documentos antes del código

## Estado de documentos

| # | Documento | Versión | Estado |
|---|---|---|---|
| 01 | [Arquitectura](./01-architecture.md) | v2.1 | ✅ CONGELADO |
| 02 | [Business Rules](./02-business-rules.md) | v1.1 | ✅ CONGELADO |
| 03 | [Domain Model](./03-domain-model.md) | v1.1 | ✅ CONGELADO |
| 04 | [ERD](./04-erd.md) | v1.0 | ✅ CONGELADO |
| 05 | [OpenAPI Contracts](./05-api-contracts.md) | v1.0 | ✅ CONGELADO |
| 06 | [Design System](./06-design-system.md) | v1.1 | ✅ CONGELADO |
| 07 | [Roadmap Funcional](./07-roadmap.md) | v1.1 | ✅ CONGELADO |

## Regla de congelamiento

Un documento **CONGELADO** no puede modificarse sin crear un ADR que justifique el cambio.
Los documentos en **EN REVISIÓN** están abiertos a feedback.
Los documentos **PENDIENTES** aún no han iniciado.

## Orden de dependencias

```
01-architecture
      │
      ▼
02-business-rules
      │
      ▼
03-domain-model
      │
      ▼
04-erd
      │
      ▼
05-api-contracts
      │
      ├──► 06-design-system
      │
      └──► 07-roadmap
```

## ADRs

Los Architecture Decision Records viven en `./adr/`. Cada cambio significativo
a un documento CONGELADO requiere un ADR previo.
