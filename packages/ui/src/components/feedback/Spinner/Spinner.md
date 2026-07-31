# Spinner

Indicador visual de carga. Diseñado para ser extremadamente simple y heredar el color de texto actual (`currentColor`).

## API (Congelada)

```ts
interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  className?: string;
}
```

## Reglas (Do's and Don'ts)

### ✅ Do
- Usar dentro de botones u otros elementos donde heredará automáticamente el `currentColor`.
- Definir un `label` cuando el spinner es el único elemento visible en pantalla (para accesibilidad).
- Usar los tamaños predefinidos de la escala.

### 🚫 Don't
- No añadir variantes de color nativas al componente (usar utilidades text-* si necesitas un color específico).
- No usar estilos inline.
- No envolver en contenedores innecesarios.

## Accesibilidad
- Siempre utiliza `role="status"`.
- Utiliza `aria-label` con un valor por defecto ("Cargando") para lectores de pantalla.
- Si se provee `label`, también renderiza un `span` oculto (`sr-only`) visible sólo para screen readers.
