# Input Component

Campo de formulario fundamental para la recolección de datos de texto.

## Importación

```tsx
import { Input } from '@mymoney/ui/components/Input';
```

## Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `id` | `string` | **Required** | Identificador único, usado para enlazar el `Label` automáticamente. |
| `name` | `string` | **Required** | Nombre del campo para el envío del formulario. |
| `label` | `string` | `undefined` | Texto descriptivo encima del input. Genera automáticamente un `<label>` asociado. |
| `placeholder` | `string` | `undefined` | Texto de sugerencia dentro del input vacío. |
| `helperText` | `string` | `undefined` | Texto informativo bajo el input. |
| `error` | `string` | `undefined` | Mensaje de error. Si está presente, reemplaza al `helperText` y cambia los bordes a rojo. |
| `required` | `boolean` | `false` | Marca el campo como obligatorio (añade un `*` al label visualmente). |
| `disabled` | `boolean` | `false` | Deshabilita interacciones. |
| `readOnly` | `boolean` | `false` | Marca el campo como solo lectura. |
| `autoComplete` | `string` | `undefined` | Atributo nativo de autocompletado (ej: `email`, `current-password`). |
| `type` | `HTMLInputTypeAttribute` | `'text'` | Tipo de input nativo (ej: `text`, `email`, `password`, `number`). |
| `leftIcon` | `IconName` | `undefined` | Icono a mostrar a la izquierda dentro del campo. |
| `rightIcon` | `IconName` | `undefined` | Icono a mostrar a la derecha dentro del campo. |

*(Acepta todas las props nativas de HTMLInputElement)*

## Reglas de Uso (Do & Don't)

✅ **Do**
- Siempre proporcionar un `id` y `name` únicos.
- Usar `type="email"` o `type="password"` cuando aplique para mejor experiencia móvil y seguridad.
- Delegar el manejo del estado del input a un sistema de formularios estructurado (ej. `react-hook-form`).

❌ **Don't**
- **NO** omitir el `label` a menos que sea un campo de búsqueda donde el contexto sea extremadamente obvio (e incluso entonces, proveer `aria-label`).
- **NO** usar estilos en línea (`style={{...}}`).
- **NO** usar `placeholder` como sustituto de un `label`.

## Ejemplos

### Básico
```tsx
<Input 
  id="username" 
  name="username" 
  label="Nombre de Usuario" 
  placeholder="ej. carlos123" 
/>
```

### Con Error e Iconos
```tsx
<Input 
  id="email" 
  name="email" 
  type="email"
  label="Correo Electrónico" 
  leftIcon="mail"
  error="Correo inválido"
/>
```
