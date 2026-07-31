# Frontend Design System

Este documento centraliza los Design Tokens transversales y el lenguaje visual de la aplicación. **Ningún componente de UI debe escribirse sin respetar estas bases.**

## Fase 2.0.5: Visual Language & Principles

Antes de los tokens técnicos, estas son las reglas estéticas fundamentales de MyMoney, diseñadas para transmitir **confianza, estabilidad y claridad**:

1. **Iconografía**: Estilo outline consistente (Lucide React). Encapsulado siempre en un componente `<Icon>` propio.
2. **Densidad**: Media. Suficiente espacio para la lectura clara de datos financieros, pero sin exagerar márgenes (uso predominante de token de espaciado `16px`).
3. **Esquinas (Radius)**: Suavemente redondeadas (`md`: 8px, `lg`: 12px) para modernidad sin perder seriedad.
4. **Sombras (Elevation)**: Mínimas y funcionales. Flat design por defecto, usando sombras solo para despegue modal (`lg`) o interacciones sutiles (`sm`).
5. **Uso del Color**: "El color comunica acciones, no decoración". Superficies mayormente neutras. Colores semánticos estrictos para presupuestos y estados.
6. **Modo Oscuro**: Paleta semántica propia. Nunca una inversión matemática.

---

## 1. Colors

Se deben usar variables CSS o Tailwind utility classes mapeadas a esta escala. El color primario es un **Azul Financiero** (confianza).

### Semantic Palette
| Categoría | Uso | Valor Recomendado (Tailwind eq.) |
| :--- | :--- | :--- |
| **Primary** | Acciones principales, botones de submit, links. | Blue `600` |
| **Success** | Budgets sanos, transacciones de ingreso. | Emerald `500` |
| **Warning** | Budgets cercanos a expiración/saturación. | Amber `500` |
| **Error** | Destructivos, transacciones fallidas. | Rose `500` |
| **Info** | Mensajes de ayuda, tooltips. | Sky `500` |

### Neutral Scale
Gris sobrio para fondos y textos: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`. (ej. Slate o Zinc).

### Theming (Light/Dark Mapping)
Todo color usado en UI debe apuntar a un alias de tema, no al color crudo:
- `bg-background` (Light: White, Dark: Neutral 950)
- `bg-surface` (Light: Neutral 50, Dark: Neutral 900)
- `text-primary` (Light: Neutral 900, Dark: Neutral 50)
- `text-secondary` (Light: Neutral 500, Dark: Neutral 400)
- `border-subtle` (Light: Neutral 200, Dark: Neutral 800)

---

## 2. Typography

- **Font Family**: Base: `Inter` (sans). Monospace para datos crudos: `mono`.
- **Escala de Tamaños Estricta**:
  - `xs`: 12px
  - `sm`: 14px
  - `md` (base): 16px
  - `lg`: 18px
  - `xl`: 20px
  - `2xl`: 24px
  - `3xl`: 30px
  - `4xl`: 36px
- **Font Weight**: Normal (400), Medium (500), Semibold (600), Bold (700).
- **Line Height**: None (1), Tight (1.25), Snug (1.375), Normal (1.5), Relaxed (1.625).

---

## 3. Spacing

Escala estricta basada en multiplicadores de 4px (0.25rem).

- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px (Base de paddings/margins)
- `5` = 20px
- `6` = 24px
- `8` = 32px
- `10` = 40px
- `12` = 48px
- `16` = 64px

---

## 4. Radius

Curvatura de los contenedores para una estética consistente.

- `sm`: 4px (Checkboxes, tags pequeños)
- `md`: 8px (Inputs, botones)
- `lg`: 12px (Tarjetas, contenedores)
- `xl`: 16px (Modales grandes o layouts)
- `full`: 9999px (Avatares, pills)

---

## 5. Elevation (Sombras)

Solo tres niveles permitidos.

- `sm`: Sutil, para dropdowns o inputs con hover.
- `md`: Tarjetas base, modales secundarios.
- `lg`: Modales principales, notificaciones (Toasts).

---

## 6. Iconography Scale

Librería oficial: **Lucide React**. Se consumirá *exclusivamente* a través de un wrapper `<Icon name="plus" />`.

Escala estricta de tamaños:
- `xs`: 16px
- `sm`: 20px
- `md`: 24px
- `lg`: 32px

---

## 7. Animation

Curvas de tiempo estandarizadas. Una única curva de aceleración para toda la app (`ease-in-out` o similar).

- `fast`: 100ms
- `normal`: 150ms
- `medium`: 200ms
- `slow`: 300ms

---

## 8. Breakpoints

Para diseño Responsive (Mobile First).

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 9. Accessibility (A11y)

Parte central del Design System:
- **Focus Ring**: Todo elemento interactivo (`button`, `input`, `a`) debe tener un anillo de foco visible vía teclado (`ring-2 ring-primary-600 ring-offset-2`).
- **Navegación con Teclado**: Todo flujo crítico debe ser operable con `Tab` y `Enter/Space`.
- **Contraste Mínimo**: La relación de contraste texto/fondo debe ser ≥ 4.5:1 (WCAG AA).
- **Áreas Táctiles**: Mínimo de 44x44px interactivos en vistas móviles.
- **Estados Semánticos**: Uso obligatorio de `disabled`, `aria-busy` (loading), `aria-invalid`, y `aria-expanded` en componentes base.
