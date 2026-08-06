# ADR-004: Invalidation Strategy

## Context
El sistema maneja entidades con dependencias cruzadas (ej. crear una Transacción afecta el balance de una Cuenta y la ejecución de un Presupuesto).

## Decision
Las invalidaciones de caché de React Query no deben estar dispersas ni duplicadas a lo largo de hooks de negocio. Deben estar centralizadas por dominio.

## Rules
- **Centralización estricta**: Los llamados a `queryClient.invalidateQueries(...)` están prohibidos en todo el proyecto salvo dentro del archivo `invalidations.ts` correspondiente al dominio en la capa `entities`.
- **Funciones semánticas**: Cada dominio exportará un objeto de invalidación (ej. `accountInvalidations`, `transactionInvalidations`) con métodos semánticos (`onCreate`, `onUpdate`, `onDelete`).
- **Dependencias Cruzadas**: Si una acción en el dominio `A` afecta el dominio `B` (ej. crear una transacción altera cuentas), el método `transactionInvalidations.onCreate(queryClient)` internamente invalidará tanto `transactionKeys` como `accountKeys`. Las dependencias cruzadas se orquestan aquí.
