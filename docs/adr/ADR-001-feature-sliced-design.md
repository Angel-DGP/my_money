# ADR-001: Feature Sliced Design

## Context
A medida que la aplicación escalaba, la organización tradicional por tipo de archivo (ej. `components`, `hooks`, `services`) dificultaba el mantenimiento, al acoplar lógicamente distintas áreas de negocio que no debían mezclarse. Esto derivó en un código difícil de extender y de aislar.

## Decision
Adoptar la arquitectura **Feature-Sliced Design (FSD)** adaptada a las necesidades de React. FSD nos proporciona una segregación estricta de las responsabilidades dividiendo el proyecto en capas (Layers), agrupaciones (Slices) y segmentos (Segments).

## Rules
Las capas permitidas en este proyecto y su dependencia son estrictamente jerárquicas (una capa superior puede importar de una inferior, pero NUNCA al revés):

1. **`app`**: Configuración global, providers, router y layout principal.
2. **`pages`**: Capa de composición. Las páginas no contienen lógica de negocio, solo orquestan widgets y features para una vista ruteada.
3. **`widgets`**: Bloques independientes de UI (ej. `AccountsListWidget`). Orquestan varias features o entities. No pueden realizar peticiones Axios de forma directa.
4. **`features`**: Funcionalidades específicas del negocio (ej. `AccountForm`, `TransactionsList`). Consumen entidades. 
5. **`entities`**: Lógica de negocio core (estado global, peticiones a API, tipos, hooks especializados por dominio). Aquí residen `queries.ts`, `invalidations.ts`, `keys.ts` y tipos DTO.
6. **`shared`**: Código genérico no atado a ningún dominio de negocio (configuración de red, clientes HTTP, utilidades globales, hooks genéricos). 

## Consecuencias
- **Positivas**: Altamente escalable, promueve el aislamiento de dominios, facilita la eliminación de features muertas.
- **Negativas**: Mayor costo inicial de estructura (overhead de carpetas), requiere disciplina estricta de imports.
