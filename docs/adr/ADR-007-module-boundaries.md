# ADR-007: Module Boundaries

## Context
A pesar de contar con FSD, la libertad de importar archivos profundos o cruzar referencias indebidas (ej. `entities` consumiendo de `features`) generaba acoplamientos invisibles y dependencias circulares potenciales.

## Decision
Establecer un flujo direccional estricto de dependencias a lo largo de las capas FSD y forzar la exposición de todo el código de un módulo mediante su archivo `index.ts`.

## Rules
- **Flujo de Arquitectura**: 
  ```text
  app -> pages -> widgets -> features -> entities -> shared
  ```
- **Prohibiciones Absolutas**:
  - `entities` NO PUEDE importar de `features`, `widgets`, `pages`, `app`.
  - `features` NO PUEDE importar de `widgets`, `pages`, `app`.
  - `shared` NO PUEDE importar de `entities` ni de ninguna capa superior.
  - `widgets` NO DEBEN importar de `shared/api/services` (su interacción con datos es a través de hooks provistos por `entities`).
  - `pages` NO DEBEN poseer lógica de negocio y NO DEBEN importar directamente de `entities/model`.

- **Public API de Módulo (Index)**: 
  Para proteger los detalles internos de implementación, TODO acceso externo a un módulo se debe realizar mediante su `index.ts` principal.
  - **Uso Correcto**: `import { useAccountsQuery } from "@entities/account";`
  - **Uso Prohibido**: `import { useAccountsQuery } from "@entities/account/model/queries";`

## Consecuencias
- Un modelo de desarrollo en donde el refactoring interno (mover carpetas dentro de un feature) es completamente invisible para el resto del sistema, reduciendo el riesgo de regresiones.
