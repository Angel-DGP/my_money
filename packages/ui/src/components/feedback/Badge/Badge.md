# Badge

Elemento visual para resaltar estados, categorías o etiquetas pequeñas. 

## API (Congelada)

```ts
interface BadgeProps {
  variant?: "primary" | "neutral" | "success" | "warning" | "error";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}
```

## Reglas (Do's and Don'ts)

### ✅ Do
- Usar los colores semánticos (`variant`) para transmitir estados (ej. verde para success).
- Combinar con `Icon` (pasándolo como hijo) si se requiere un apoyo visual extra.
- Mantener el texto interno muy corto (1-3 palabras).

### 🚫 Don't
- No añadir colores arbitrarios ni estilos inline.
- No incluir iconografía propia directamente dentro de Badge (debe inyectarse usando el componente `Icon` vía `children`).
- No usar para acciones interactivas. Badge no es un `Button`.
