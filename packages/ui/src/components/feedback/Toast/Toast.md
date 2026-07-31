# Toast

Notificaciones no obstructivas que aparecen temporalmente en la pantalla para informar al usuario sobre el resultado de una acción.

## Configuración y Renderizado

El sistema de Toasts requiere un único componente `<Toaster />` renderizado idealmente en la raíz de la aplicación.
Luego, las notificaciones se disparan mediante una función imperativa `toast()`.

```tsx
import { Toaster, toast } from '@mymoney/ui';

function App() {
  return (
    <>
      <ComponenteCualquiera />
      <Toaster />
    </>
  );
}

function ComponenteCualquiera() {
  return (
    <Button onClick={() => toast({ title: 'Guardado', variant: 'success' })}>
      Guardar
    </Button>
  );
}
```

## API de `toast(options)`

| Opción | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | *(Requerido)* | El título principal de la notificación. |
| `description` | `string` | `undefined` | Texto secundario explicativo. |
| `variant` | `'default' \| 'success' \| 'error' \| 'warning'` | `'default'` | El estilo y color de la notificación. |
| `duration` | `number` | `5000` | Tiempo en milisegundos antes de desaparecer automáticamente. `0` para que no desaparezca. |
| `action` | `{ label, onClick }` | `undefined` | Un botón de acción principal (ej. "Deshacer"). |
| `cancel` | `{ label, onClick }` | `undefined` | Un botón de acción secundaria o cancelación explícita. |

## Accesibilidad
- Renderiza dentro de un `role="region"` y `aria-label="Notifications"`.
- Los toasts individuales usan `role="alert"`.
- Los botones de acción son completamente navegables por teclado.
