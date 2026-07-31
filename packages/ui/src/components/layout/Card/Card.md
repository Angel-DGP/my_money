# Card

El componente `Card` es el contenedor estructural base para la agrupación de contenido relacionado. Sigue un modelo estricto de composición mediante subcomponentes (`Header`, `Body`, `Footer`) y evita el paso masivo de props que generen inflexibilidad.

## Composición
- **`Card`**: El contenedor raíz. Provee el contexto de `padding` y aplica bordes, radios y fondo.
- **`Card.Header`**: Área superior de la tarjeta (típicamente para títulos o acciones globales de la tarjeta).
- **`Card.Body`**: Área de contenido principal.
- **`Card.Footer`**: Área inferior, generalmente para acciones de confirmación/cancelación o metadatos.

## Polimorfismo (`asChild`)
Por defecto el componente renderiza un `<div />`. Puedes convertir toda la tarjeta en un elemento semántico distinto o interactivo utilizando `asChild` junto a un componente hijo directo.

```tsx
<Card asChild>
  <a href="/settings">
    <Card.Body>Settings</Card.Body>
  </a>
</Card>
```

## Propiedades (API)

### `Card`
| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `asChild` | `boolean` | `false` | Delega el renderizado al hijo inmediato usando `<Slot />` |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Define el espaciado interno que se distribuye a los subcomponentes. |

### `Card.Header`, `Card.Body`, `Card.Footer`
Aceptan props estándar de HTML (`HTMLDivElement`) y `asChild` para polimorfismo. El padding interno se ajusta automáticamente basándose en la prop `padding` del `Card` contenedor.
