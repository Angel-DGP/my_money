# Button Component

Componente interactivo principal para disparar acciones o navegar.

## Importación

```tsx
import { Button } from '@mymoney/ui/components/Button';
```

## Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive' \| 'link'` | `'primary'` | Variación visual del botón. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño predefinido del botón. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo nativo HTML. Usar `submit` dentro de formularios. |
| `disabled` | `boolean` | `false` | Deshabilita interacciones. |
| `loading` | `boolean` | `false` | Muestra un spinner y deshabilita el botón. |
| `fullWidth` | `boolean` | `false` | Ocupa el 100% del contenedor padre. |
| `leftIcon` | `IconName` | `undefined` | Icono a mostrar a la izquierda del texto. |
| `rightIcon` | `IconName` | `undefined` | Icono a mostrar a la derecha del texto. |

*(Acepta todas las props nativas de HTMLButtonElement)*

## Reglas de Uso (Do & Don't)

✅ **Do**
- Usar la variante `primary` solo para la acción principal de una vista.
- Proveer un texto claro y conciso basado en verbos de acción.
- Usar `fullWidth` en formularios o modals móviles.

❌ **Don't**
- **NO** usar estilos en línea (`style={{...}}`).
- **NO** pasar componentes React como hijos a `leftIcon` o `rightIcon`. Usa los strings definidos en el registry (ej: `leftIcon="plus"`).
- **NO** usar un botón para enlaces de navegación a menos que sea una acción explícita. Para enlaces puros usar un ancla `<a>` nativo (o Link de React Router).
- **NO** acumular múltiples botones `primary` en la misma pantalla.

## Ejemplos

### Variantes
```tsx
<Button variant="primary">Continuar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="destructive">Eliminar Cuenta</Button>
<Button variant="ghost">Omitir</Button>
```

### Con Iconos
```tsx
<Button leftIcon="plus">Añadir Transacción</Button>
<Button variant="outline" rightIcon="chevron-right">Siguiente</Button>
```

### Estados
```tsx
<Button loading>Guardando...</Button>
<Button disabled>Acción no permitida</Button>
```
