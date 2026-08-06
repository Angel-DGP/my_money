# ADR-006: Dashboard Architecture

## Context
El Dashboard es el hub central donde convergen datos de múltiples dominios (Cuentas, Transacciones, Metas, Presupuestos). Si el Dashboard calculaba o preparaba datos, rompía la responsabilidad del Frontend y acoplaba modelos en un lugar incorrecto.

## Decision
El Dashboard funciona puramente como un marco orquestador. 
Consiste de una página (`DashboardPage`) y múltiples Widgets agnósticos de contexto (`AccountsSummaryWidget`, `RecentTransactionsWidget`, etc.)

## Rules
- **No cálculos matemáticos**: Los componentes del Dashboard, al igual que los de progreso (ej. `BudgetProgress`), solo reciben la data procesada (spent vs limit, percentages) y la pintan. Es labor del Backend entregar los DTOs con los cálculos pertinentes.
- **Widgets asilados**: Cada Widget en el Dashboard es responsable de instanciar los hooks a React Query necesarios para obtener sus datos. El Layout del Dashboard solo se encarga de ubicar el grid de CSS para organizarlos visualmente.
