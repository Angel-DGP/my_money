# ADR-002: Design System

## Context
Para asegurar coherencia visual y reutilización sin reescribir estilos Tailwind repetitivos o depender de bibliotecas pesadas de terceros (MUI, AntD, etc.), necesitábamos una base unificada.

## Decision
Construir y utilizar exclusivamente un Design System interno ubicado en `packages/ui`. 
Este Design System (actualmente v1.1) se encuentra **congelado** para su uso estructural y contiene:
1. **Tokens (Primitives)**: Colores (`bg-base`, `text-muted`, etc.), spacing, sombras y utilidades fundamentales que aseguran uniformidad, particularmente útiles para un futuro modo oscuro.
2. **Componentes Puros**: `Button`, `Input`, `Badge`, `Icon`, etc.
3. **Componentes Compuestos**: `Amount`, `CurrencyField`, `MoneyInput`, `TransactionCard`, `BudgetProgress`, `GoalProgress`.

## Rules
- Los componentes de `@mymoney/ui` son presentacionales.
- **Prohibición de Lógica de Negocio**: Un componente del Design System jamás debe acceder a React Query, Zustand, Axios o Routers (ej. `react-router-dom`). Deben recibir toda la información por `props`.
- **Modificación**: Al estar congelado (Architecture Freeze v1.0), cualquier cambio a componentes subyacentes que rompa compatibilidad debe discutirse en un nuevo ADR.
