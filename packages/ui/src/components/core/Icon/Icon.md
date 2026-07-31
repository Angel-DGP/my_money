# Icon Component

Wrapper estricto sobre `lucide-react` para garantizar accesibilidad, escalabilidad y tree-shaking, centralizando los iconos permitidos.

## Importación

```tsx
import { Icon } from '@mymoney/ui/components/Icon';
```

## Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `name` | `IconName` | **Required** | Nombre del icono registrado. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño predefinido del icono. |
| `decorative` | `boolean` | `true` | Si es true, el icono se oculta de lectores de pantalla. |
| `title` | `string` | `undefined` | Texto accesible si el icono NO es decorativo. |
| `className` | `string` | `undefined` | Clases adicionales (usar con precaución). |

## Reglas de Uso (Do & Don't)

✅ **Do**
- Usar SIEMPRE este componente en lugar de importar directamente de `lucide-react`.
- Definir `decorative={false}` y proporcionar un `title` si el icono es el único contenido de un botón o enlace.
- Elegir iconos que comuniquen claramente la acción o estado.

❌ **Don't**
- **NO** pasar números arbitrarios a `size`. Usa exclusivamente la escala `xs`, `sm`, `md`, `lg`.
- **NO** usar estilos en línea (`style={{ color: 'red' }}`). Utiliza `className` con utilidades de Tailwind si requieres forzar un color.
- **NO** olvidar actualizar el `registry.ts` si necesitas un nuevo icono de Lucide.

## Ejemplos

### Básico (Decorativo)
```tsx
<Icon name="plus" />
```

### Accesible (Informativo)
```tsx
<Icon name="info" decorative={false} title="Información adicional" />
```

### Variaciones de Tamaño
```tsx
<Icon name="check" size="xs" />
<Icon name="check" size="sm" />
<Icon name="check" size="md" />
<Icon name="check" size="lg" />
```
