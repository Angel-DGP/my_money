# ADR-005: UI Composition Rules

## Context
Para evitar "Prop Drilling" excesivo y componentes monstruosos que manejan vistas enteras (anti-patrón de Dios), se establecen reglas estrictas sobre cómo componer la UI.

## Decision
La UI se construye como un Lego de responsabilidades segregadas:
- **Pages**: Capa superior de ruteo. Deciden *qué* Layout usar y montan Widgets. No tienen lógica ni peticiones de datos.
- **Widgets**: Son los "Organismos" o directores de orquesta. Tienen conocimiento del negocio general. Son dueños del estado local de modales (formularios) e interactúan con los hooks de peticiones.
- **Features**: Representan una acción o vista puntual de dominio (ej. la tabla, el formulario). 
- **Tablas y Listas**: Deben ser "Tontas" (Dumb Components). Solo pintan. Las funciones `onEdit` o `onDelete` se pasan por props desde el Widget.
- **Formularios (Forms)**: Tampoco conocen a React Query. Reciben `onSubmit`, `onCancel` y `isLoading` por props.
- **Toasts de feedback**: Los hooks (`entities`) no lanzan Toasts (son capa de datos). Quien orquesta la UI (`Widget` o `Feature` que maneja el formulario) es el responsable de ejecutar el `toast` ante `onSuccess` o `onError`.
