# BudgetProgress

Componente visual específico del dominio (Fase 2.3B) para mostrar el consumo de un presupuesto.

## Responsabilidades
- Renderiza una barra de progreso que cambia semánticamente de color según el estado:
  - `< 85%`: Normal (`primary`)
  - `> 85%`: Warning (`warning`)
  - `> 100%`: Excedido (`error`)
- Calcula internamente el porcentaje y el restante.
- Cumple con la regla estricta: No hace *fetching* ni conoce del modelo del backend. Solo recibe `spent` y `limit`.

## Uso

```tsx
import { BudgetProgress } from '@mymoney/ui';

function BudgetCard() {
  return (
    <div className="p-4 border rounded-xl w-80">
      <h3 className="font-semibold mb-4">Groceries</h3>
      <BudgetProgress 
        spent={450} 
        limit={500} 
      />
    </div>
  );
}
```

## Propiedades

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `spent` | `number` | *(requerido)* | Monto gastado actualmente en el presupuesto. |
| `limit` | `number` | *(requerido)* | Monto límite del presupuesto. |
| `currency` | `string` | *(Provider)* | Moneda utilizada para mostrar los valores. |
| `showPercentage` | `boolean` | `true` | Muestra el porcentaje calculado arriba a la derecha. |
| `showRemaining` | `boolean` | `true` | Muestra el monto disponible o excedido en la parte inferior. |
