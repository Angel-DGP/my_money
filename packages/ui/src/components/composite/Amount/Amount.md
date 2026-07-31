# Amount

Componente compuesto base de Fase 2.3A. Se utiliza para formatear numéricamente cantidades de dinero usando la API nativa de internacionalización (`Intl.NumberFormat`).

## Uso

```tsx
import { Amount } from '@mymoney/ui';

// Uso simple: hereda locale y currency globales a través del UIConfigProvider
<Amount value={1250} />

// Uso avanzado
<Amount
  value={-1250.45}
  variant="expense"
  size="xl"
  signDisplay="always"
/>
```

## Propiedades

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `number` | *(requerido)* | El número crudo a formatear. **Nunca recibe strings**. |
| `currency` | `string` | `USD` (via Provider) | Código ISO 4217 de la moneda. |
| `locale` | `string` | `en-US` (via Provider) | Código BCP 47 para la región. |
| `variant` | `'neutral' \| 'income' \| 'expense'` | `'neutral'` | Estilo de color semántico para representar ingresos o gastos. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamaño de la tipografía. |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold'` | `'semibold'` | Peso de la tipografía. |
| `signDisplay` | `'auto' \| 'always' \| 'never'` | `'auto'` | Control sobre cuándo mostrar el signo negativo o positivo. Si se pasa `'never'`, siempre muestra el valor absoluto. |
