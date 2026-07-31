# TransactionCard

El componente compuesto más complejo del Design System. Combina `Card`, `Icon`, `Amount`, y `Badge` para mostrar de manera consistente una transacción financiera.

## Regla de Composición y Dependencias
Acorde a la arquitectura de My Money, `TransactionCard` **está estrictamente prohibido** de conocer o importar modelos de datos del backend (Ej: no recibe un objeto `Transaction`), y no debe hacer fetching de datos ni mutaciones internamente (no `useMutation`, no axios).
Solo acepta propiedades planas que describen su aspecto visual.

## Uso

```tsx
import { TransactionCard } from '@mymoney/ui';

function TransactionList() {
  return (
    <TransactionCard
      title="Starbucks"
      category="Food & Drink"
      date={new Date("2024-03-14T15:30:00Z")}
      amount={15.50}
      variant="expense"
      icon="coffee"
      badges={[{ text: 'Card ending in 4242' }]}
    />
  );
}
```

## Propiedades

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | *(requerido)* | Nombre del comercio o descripción de la transacción. |
| `amount` | `number` | *(requerido)* | Valor de la transacción. |
| `date` | `Date` | *(requerido)* | Fecha y hora (será formateada internamente según el locale). |
| `category` | `string` | `undefined` | Texto de la categoría. |
| `variant` | `'income' \| 'expense' \| 'transfer'` | `'expense'` | Define los colores semánticos y el signo de la cantidad. |
| `icon` | `IconName` | `'circle'` | Icono principal de la transacción. |
| `badges` | `TransactionBadge[]` | `[]` | Array de etiquetas descriptivas debajo del título. |
| `actions` | `ReactNode` | `undefined` | Espacio a la derecha (normalmente para un botón Dropdown). |
