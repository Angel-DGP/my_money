# Label Component

Un primitivo para asociar texto a elementos de formulario garantizando la accesibilidad.

## Importación

```tsx
import { Label } from '@mymoney/ui/components/Label';
```

## Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `htmlFor` | `string` | **Required** | ID del input al que este label está asociado. |
| `children` | `ReactNode` | **Required** | El texto o contenido del label. |
| `className` | `string` | `undefined` | Clases adicionales (usar con precaución). |

*(También acepta todos los props estándar de un elemento `<label>`)*

## Reglas de Uso (Do & Don't)

✅ **Do**
- Usar siempre `Label` junto con un `Input`, `Select` u otro campo de formulario.
- Asegurarse de que el valor de `htmlFor` coincida exactamente con el `id` del input asociado.

❌ **Don't**
- **NO** omitir el prop `htmlFor`. Es obligatorio por razones de accesibilidad.
- **NO** usar estilos en línea (`style={{...}}`).
- **NO** usar este componente para mostrar texto genérico. Usar estilos de tipografía estándar para texto que no sea un label de formulario.

## Ejemplos

### Básico
```tsx
<Label htmlFor="email-input">Correo Electrónico</Label>
<Input id="email-input" />
```
