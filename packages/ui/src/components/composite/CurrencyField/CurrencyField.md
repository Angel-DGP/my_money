# CurrencyField

Wrapper completo para formularios que combina internamente `Label`, `MoneyInput` y los mensajes de estado (`helperText`, `error`). 
Mantiene la misma filosofía que `MoneyInput` pero orientado a ser insertado directamente en layouts de formularios.

## Jerarquía de Componentes
```
CurrencyField
 ├── Label
 ├── p (description)
 ├── MoneyInput
 └── p (error | helperText)
```

## Uso

```tsx
import { CurrencyField } from '@mymoney/ui';
import { useState } from 'react';

function Form() {
  const [amount, setAmount] = useState<number | null>(null);

  return (
    <CurrencyField
      label="Monto de la Transferencia"
      description="El dinero será descontado de tu cuenta principal"
      value={amount}
      onValueChange={setAmount}
      helperText="Límite diario: $5,000"
      error={amount && amount > 5000 ? 'Excede el límite' : undefined}
    />
  );
}
```

## Propiedades

Hereda todas las propiedades de `MoneyInputProps`, y agrega las siguientes:

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | *(requerido)* | Texto del label principal. |
| `description` | `string` | `undefined` | Texto de ayuda detallado bajo el label. |
| `helperText` | `string` | `undefined` | Texto de ayuda bajo el input. |
| `error` | `string` | `undefined` | Mensaje de error. Si está presente, reemplaza al `helperText` y cambia el estado visual a inválido. |
| `wrapperClassName` | `string` | `undefined` | Clases CSS adicionales para el contenedor principal. |

## Accesibilidad
- Genera IDs automáticos (con `useId()`) para linkear el `Label` con el `Input`.
- Aplica correctamente `aria-invalid` y `aria-describedby` para conectar las descripciones de error y helper al input de forma que los screen readers las lean automáticamente.
