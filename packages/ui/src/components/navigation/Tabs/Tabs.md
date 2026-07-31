# Tabs

Un conjunto de vistas en capas, organizadas mediante pestañas. Las Tabs son fundamentales para dividir configuraciones o vistas complejas sin navegar a diferentes URLs.

## Composición

- `<Tabs>`: El componente principal y proveedor de contexto.
- `<TabsList>`: Contenedor para los `<TabsTrigger>`. Funciona como el menú visible.
- `<TabsTrigger>`: El botón individual que activa una pestaña específica.
- `<TabsContent>`: El contenido renderizado cuando se activa la pestaña.

## Props Clave de Configuración

### `orientation` (`'horizontal' | 'vertical'`)
Controla la dirección visual y el flujo de navegación por teclado.
- `horizontal` (default): Pestañas alineadas de izquierda a derecha. Se navega con flechas ⬅️ y ➡️.
- `vertical`: Pestañas alineadas de arriba hacia abajo (ideal para Settings). Se navega con flechas ⬆️ y ⬇️.

### `activationMode` (`'automatic' | 'manual'`)
Controla cómo se seleccionan las pestañas al navegar con el teclado.
- `automatic` (default): Al mover el foco con las flechas, la pestaña y su contenido se activan inmediatamente.
- `manual`: El foco se mueve por las pestañas con las flechas, pero el usuario debe presionar `Enter` o `Espacio` explícitamente para activar su contenido.

## Accesibilidad
La implementación respeta los estándares de la W3C (ARIA Authoring Practices) para tabs:
- Roles semánticos: `tablist`, `tab`, `tabpanel`.
- Linkeos ARIA (`aria-controls`, `aria-labelledby`).
- Soporte para navegación con teclado circular (`Arrow`, `Home`, `End`).
