# Dropdown

Un menú flotante contextual, accionado mediante un click (trigger).

## Composición

- `<Dropdown.Root>`: Provee el estado interno `open`.
- `<Dropdown.Trigger>`: El elemento en el cual el usuario hace clic para mostrar u ocultar el menú.
- `<Dropdown.Content>`: Contenedor flotante (`Portal`). Se renderiza usando posición absoluta basada en su posición respecto al trigger.
- `<Dropdown.Item>`: Opción clickeable dentro del dropdown. Cierra el menú automáticamente al hacer click.
- `<Dropdown.Separator>`: Línea divisoria semántica entre grupos de opciones.

## Configuración de Posición

El `<Dropdown.Content>` acepta propiedades paramétricas para controlar su renderizado:

- `side`: `'top' | 'right' | 'bottom' | 'left'` (por defecto `'bottom'`)
- `align`: `'start' | 'center' | 'end'` (por defecto `'center'`)
- `offset`: Distancia en píxeles del menú respecto al trigger (por defecto `4`)

```tsx
<Dropdown.Content side="top" align="end" offset={8}>
  {/* ... */}
</Dropdown.Content>
```

## Accesibilidad (A11y)
- Controles de ARIA automáticos (`aria-expanded`, `aria-haspopup`).
- Escucha de teclas: Presionar `Escape` cierra el dropdown.
- Clic fuera (Click outside) implementado nativamente.
- Elementos deshabilitados mediante `disabled={true}` y aplicados con el atributo `data-disabled` para selectores de estilos seguros.
