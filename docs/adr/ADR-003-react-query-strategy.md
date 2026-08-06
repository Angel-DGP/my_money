# ADR-003: React Query Strategy

## Context
Se requería una solución robusta para el manejo de estado asíncrono, caché, reintentos e invalidación.

## Decision
Utilizar `@tanstack/react-query` de forma estandarizada en todo el módulo web, encapsulando su uso exclusivamente dentro de la capa `entities` a través de custom hooks.

## Rules
- **Encapsulación**: Las peticiones de Axios a `shared/api/services` deben estar envueltas en un hook como `useEntityQuery` o `useCreateEntity` expuesto en `entities/<dominio>/model/queries.ts`.
- **Prohibido el acceso directo**: Ni `Pages`, ni `Widgets`, ni `Features` deben usar Axios directamente ni llamar a los servicios. Siempre deben consumir los hooks expuestos en `entities`.
- **Query Keys Centralizadas**: No se permite usar llaves mágicas tipo string (ej. `['accounts']`). Se debe usar de forma obligatoria el factory `entityKeys.lists()` o `entityKeys.detail(id)` definido en `entities/<dominio>/model/keys.ts`.
- **UI State**: Las queries proveen el estado crudo, pero la UI delega los estados vacíos, de carga o error al componente genérico `QueryState` para asegurar un manejo global idéntico.
