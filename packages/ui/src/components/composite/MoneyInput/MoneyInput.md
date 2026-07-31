# MoneyInput

Input numérico genérico controlado diseñado para entradas financieras (dinero, tasas, porcentajes).

## Filosofía
El componente se encarga de que la interfaz muestre el formato internacional correcto para la región, pero que **el resto de la aplicación y los esquemas de validación (Zod)** trabajen siempre con primitivos `number | null`.

## Formato y Precisión

Soporta múltiples modos para diferentes usos:

- **currency** (default): Automáticamente aplica el símbolo de la moneda y los separadores de la región.
- **decimal**: Igual pero sin el símbolo de moneda (útil para cantidades o tasas).
- **percent**: Formatea como porcentaje. (e.g. un valor de `50` se renderiza como `50%` si `precision` es 0).

```tsx
// 1. Dinero
<MoneyInput format="currency" currency="USD" value={10} onValueChange={setVal} />

// 2. Cantidad / Tasa
<MoneyInput format="decimal" precision={4} value={10.1234} />

// 3. Porcentaje
<MoneyInput format="percent" precision={0} value={50} />
```

## Propiedades

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `number \| null` | `undefined` | El valor numérico actual. NUNCA recibe un string formateado. |
| `onValueChange` | `(value: number \| null) => void` | `undefined` | Se dispara en cada tipeo retornando el valor parseado, o `null` si está vacío/inválido. |
| `format` | `'currency' \| 'decimal' \| 'percent'` | `'currency'` | Modo de formateo. |
| `currency` | `string` | *(Provider)* | Código ISO 4217 de la moneda. |
| `locale` | `string` | *(Provider)* | Código BCP 47 para la región. |
| `precision` | `number` | `2` | Cantidad de decimales fijos a mostrar e ingresar. |

*Nota:* `MoneyInput` hereda todas las propiedades estándar del componente primitivo `Input` (Nivel 1).
