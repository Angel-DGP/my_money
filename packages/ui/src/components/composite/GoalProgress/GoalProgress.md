# GoalProgress

Componente visual específico del dominio (Fase 2.3B) para mostrar el avance hacia una meta de ahorro.

## Responsabilidades
- Renderiza una barra de progreso.
- Cuando la meta se alcanza o supera, el estado visual cambia a completado (`success`).
- Calcula internamente el porcentaje y el restante.
- Cumple con la regla estricta: No hace *fetching* ni conoce del modelo del backend. Solo recibe `current` y `target`.

## Uso

```tsx
import { GoalProgress } from '@mymoney/ui';

function GoalCard() {
  return (
    <div className="p-4 border rounded-xl w-80">
      <h3 className="font-semibold mb-4">Emergency Fund</h3>
      <GoalProgress 
        current={2500} 
        target={5000} 
      />
    </div>
  );
}
```

## Propiedades

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `current` | `number` | *(requerido)* | Monto acumulado o guardado actualmente. |
| `target` | `number` | *(requerido)* | Monto objetivo de la meta. |
| `currency` | `string` | *(Provider)* | Moneda utilizada para mostrar los valores. |
| `showPercentage` | `boolean` | `true` | Muestra el porcentaje calculado arriba a la derecha. |
| `showRemaining` | `boolean` | `true` | Muestra el monto que falta por ahorrar en la parte inferior. |
