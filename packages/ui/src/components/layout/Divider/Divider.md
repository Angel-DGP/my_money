# Divider

Elemento para separar visual o semánticamente el contenido.

## API (Congelada)

```ts
interface DividerProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}
```

## Reglas (Do's and Don'ts)

### ✅ Do
- Usar `orientation="vertical"` dentro de contenedores flex con altura definida o `items-stretch`.
- Usar para separar secciones lógicas de contenido.
- Dejar `decorative={true}` (por defecto) si la separación es puramente visual y el flujo de lectura es obvio sin ella.

### 🚫 Don't
- No usar para crear bordes en contenedores (usar las utilidades de border de Tailwind en su lugar, como `border-b` o `border-r`).
- No usar para empujar contenido. Utilizar `gap` o márgenes.

## Accesibilidad
- Cuando `decorative={false}`, se le asigna explícitamente `role="separator"`.
- Si además de no ser decorativo, su orientación es vertical, se agrega `aria-orientation="vertical"` (puesto que el valor por defecto de un separator para ARIA es horizontal).
