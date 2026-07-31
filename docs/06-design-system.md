# MyMoney — Design System & UI Architecture

> **Documento**: 06 de 07
> **Versión**: 1.1.0 — Julio 2026
> **Estado**: APROBADO — congelado
> **Siguiente documento**: `07-roadmap.md`

---

> [!IMPORTANT]
> Este documento establece el diccionario visual y las directrices arquitectónicas para el frontend. Ningún estilo se debe crear "al vuelo" mediante valores estáticos no tokenizados. Todo elemento en la UI debe derivar de los tokens descritos aquí.
>
> La meta es construir una interfaz que se sienta **Premium, rápida y profesional**, a la altura del sólido Domain Model que respalda al backend.

---

## Índice

1. [Filosofía del Design System](#1-filosofía-del-design-system)
2. [Principios de Diseño (UI/UX)](#2-principios-de-diseño-uiux)
3. [Stack Tecnológico UI](#3-stack-tecnológico-ui)
4. [Design Tokens (Tipados)](#4-design-tokens-tipados)
5. [Layout, Elevación y Responsive](#5-layout-elevación-y-responsive)
6. [Estados Compartidos y Tema](#6-estados-compartidos-y-tema)
7. [Componentes Atómicos y Estados](#7-componentes-atómicos-y-estados)
8. [Data Display (Dominio Financiero)](#8-data-display-dominio-financiero)
9. [Micro-interacciones y Animaciones (Motion)](#9-micro-interacciones-y-animaciones-motion)
10. [Accesibilidad (A11y)](#10-accesibilidad-a11y)
11. [Iconografía](#11-iconografía)
12. [Implementación del Design System](#12-implementación-del-design-system)

---

## 1. Filosofía del Design System

El Design System es una librería independiente (`packages/ui`) y **no** una colección de componentes dentro de la aplicación.

- **Única fuente de verdad**: Toda la UI debe consumirse desde `packages/ui`.
- **DRY Visual**: Está estrictamente prohibido crear componentes visuales duplicados dentro de `apps/web`.
- **Evolución**: Si un componente deja de ser específico de una feature y comienza a reutilizarse (ej. una tarjeta de métrica), debe extraerse y migrarse a `packages/ui`.

---

## 2. Principios de Diseño (UI/UX)

1. **Premium y Moderno**: Evitar colores genéricos. Paletas ricas y matizadas.
2. **Dinámico y Reactivo**: Feedback visual constante en cada interacción.
3. **Consistencia Absoluta**: Uso estricto de tokens. Cero "magic numbers".
4. **Legibilidad Financiera**: Los números son los protagonistas (Tabular Nums).

---

## 3. Stack Tecnológico UI

- **Tailwind CSS**: Fuente de verdad de los tokens a través de clases utilitarias (`tailwind.config.ts`).
- **Shadcn/ui & Radix UI Primitives**: Componentes accesibles y "headless", personalizados mediante nuestro tema.
- **Framer Motion**: Animaciones fluidas, layout shifts y micro-interacciones.
- **Lucide Icons**: Set de iconos oficial.

---

## 4. Design Tokens (Tipados)

Tailwind será la fuente de verdad, pero los tokens **se exportarán también como TypeScript** para que cualquier utilidad JS pueda consumirlos. Nunca habrá colores hardcodeados en el código.

```ts
// packages/ui/src/tokens/colors.ts
export const colors = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  danger: 'hsl(var(--expense))',
  // ...
}
```

### 4.1 Background & Surface (Dark Mode First)

| Token | Dark Mode | Light Mode | Uso |
|---|---|---|---|
| `background` | HSL(240, 10%, 4%) | HSL(0, 0%, 100%) | Fondo base de la app |
| `surface` | HSL(240, 11%, 10%) | HSL(0, 0%, 98%) | Tarjetas, modales, sidebar |
| `surface-hover`| HSL(240, 11%, 15%) | HSL(0, 0%, 94%) | Efectos hover |
| `border` | HSL(240, 11%, 20%) | HSL(240, 5%, 90%) | Separadores |

### 4.2 Semantic Colors (Acciones)

- `primary`: Violeta premium. Botones primarios, acentos activos.
- `secondary`: Gris/Azulado. Acciones secundarias, tags neutrales.
- `accent`: Violeta más claro. Detalles de micro-animación.

### 4.3 Financial Colors (Dominio)

- `income` / `success`: Ingresos, Metas completadas (+).
- `expense` / `danger`: Egresos, Presupuestos excedidos (-).
- `transfer` / `info`: Transferencias (=).
- `warning`: Presupuesto al 80%.

### 4.4 Tipografía y Espaciado

- **Fuente**: Inter o Geist. `font-variant-numeric: tabular-nums;` para montos.
- **Spacing Base**: Escala de 4px (`sp-2` = 8px, `sp-4` = 16px, `sp-6` = 24px).
- **Radios**: `radius-sm` (4px), `radius-md` (8px), `radius-lg` (12px).

---

## 5. Layout, Elevación y Responsive

### 5.1 Layout Tokens

Se definen variables de layout estrictas para que la estructura sea consistente en todas las páginas:

- `sidebar-width`: 280px (fijo en desktop).
- `header-height`: 64px.
- `content-max-width`: 1200px.
- `page-padding`: 24px (desktop), 16px (mobile).
- `container-padding`: 16px.
- `card-gap`: 16px.

### 5.2 Elevation (Sombras)

Las sombras distinguen las capas de la interfaz y la profundidad visual:

- `shadow-xs`: Botones base, inputs.
- `shadow-sm`: Tarjetas en el fondo de la página.
- `shadow-md`: Dropdowns, popovers, tooltips.
- `shadow-lg`: Modales, Dialogs (elementos que bloquean la UI inferior).

### 5.3 Responsive (Mobile First)

Se utilizarán los breakpoints estándar de Tailwind:
- `sm` (640px)
- `md` (768px)
- `lg` (1024px)
- `xl` (1280px)
- `2xl` (1536px)

**Reglas de comportamiento**:
- El Sidebar principal colapsa a un menú "Hamburger" o Bottom Navigation en pantallas `< lg`.
- Los Modales/Dialogs se convierten en "Drawers" (pantalla completa o bottom sheet) en dispositivos móviles.
- Las tablas complejas (DataTables) cambian a layouts de tipo Tarjetas (`Cards`) en vistas móviles para garantizar su legibilidad sin scroll horizontal excesivo.

---

## 6. Estados Compartidos y Tema

### 6.1 Estados Globales de la UI

Toda la aplicación utilizará componentes estándar para representar los siguientes estados, asegurando que se comportan igual independientemente de la página:

- `Loading`: Spinners o skeletons estandarizados.
- `Empty`: Estado vacío ilustrado con call-to-action (ej: "Aún no tienes cuentas, crea una").
- `Skeleton`: Cargas asíncronas para layouts de dashboard.
- `Error`: Fallos en queries, con botón de reintento.
- `Offline`: Aviso discreto de pérdida de conexión.
- `Unauthorized`: Bloqueo de UI por expiración de token.
- `Not Found`: Pantalla de 404 estandarizada.

### 6.2 Theme Architecture

Ningún componente debe consultar `prefers-color-scheme` directamente usando media queries en su CSS aislado. Todo debe controlarse a través de un **ThemeProvider** global en el nivel superior de `apps/web`.

Estados soportados:
- `Light`
- `Dark`
- `System` (Sincronizado con el OS)

*(Preparado para Future Themes inyectando nuevas clases en la raíz del documento).*

---

## 7. Componentes Atómicos y Estados

Cada componente base en `packages/ui` debe modelar todos sus posibles estados de interacción y dominio.

**Ejemplo de estados obligatorios para Button e Input**:
- `Default`
- `Hover`
- `Pressed` (Active)
- `Focused` (Ring de accesibilidad visible)
- `Loading` (Muestra spinner interno, deshabilita clicks)
- `Disabled` (Opacidad reducida, no cursor)
- `Success` (Feedback visual tras acción)
- `Danger` (Para acciones destructivas)

---

## 8. Data Display (Dominio Financiero)

Componentes exclusivos de este dominio que deben existir en `packages/ui` para garantizar presentación idéntica de cifras:

- **Money**: Componente base que aplica `tabular-nums` y color condicional (verde/rojo) según si es ingreso o gasto.
- **Currency Badge**: Etiqueta para indicar moneda base (ej. "USD", "MXN").
- **Balance Card**: Tarjeta estandarizada para mostrar el balance de una cuenta, con espacio para su gráfico de tendencia.
- **Progress Indicator**: Barra o anillo de progreso para metas y presupuestos.
- **Percentage Change**: Pastilla para "+15%" o "-5%" vs el mes pasado.
- **Trend Indicator**: Gráfico mini (Sparkline) para el historial de balance.

---

## 9. Micro-interacciones y Animaciones (Motion)

Todas las animaciones comparten el mismo lenguaje temporal y físico a través de variables globales compartidas.

### 9.1 Duraciones oficiales
- `100ms`: Micro-interacciones (hover, focus, toggles).
- `150ms`: Elementos de UI rápidos (dropdowns, tooltips).
- `200ms`: Transiciones de estado moderadas (skeleton a content).
- `300ms`: Transiciones estructurales pesadas (cambio de página, modales, draweres).

### 9.2 Curvas (Easing)
- `ease-out`: Para elementos entrando a la pantalla.
- `ease-in-out`: Para elementos moviéndose entre dos posiciones.
- `spring`: (Framer Motion) Para feedback físico en acciones críticas o drag-and-drop.

---

## 10. Accesibilidad (A11y)

Cualquier producto premium debe ser accesible por defecto. Shadcn/ui provee la base técnica (vía Radix), pero el sistema debe hacer cumplir:

- **ARIA**: Atributos `aria-label` y `aria-describedby` correctos en todos los inputs e iconos interactivos sin texto.
- **Keyboard navigation**: Todo el software debe ser operable usando solo la tecla `Tab` y las flechas de dirección.
- **Focus visible**: Ring de `focus` explícito (2px a 3px de offset) que NO debe depender del hover.
- **Contraste WCAG AA**: Los colores del *Semantic Palette* y *Financial Palette* garantizan ratio mínimo 4.5:1.
- **Reduced Motion**: Respetar `@media (prefers-reduced-motion: reduce)` silenciando animaciones de Framer Motion automáticamente.
- **Screen Readers**: Textos alternativos lógicos para los gráficos financieros.

---

## 11. Iconografía

Sistema estandarizado usando **Lucide Icons**, sujeto a tamaños estrictos definidos por token:

- `16px`: Micro iconos dentro de inputs, badges pequeños o hints.
- `20px`: Tamaño estándar para botones y listas de navegación.
- `24px`: Acciones principales, íconos de tarjetas, headers de modales.
- `32px`: Ilustraciones o "Empty States" vacíos.

---

## 12. Implementación del Design System

El desarrollo de `packages/ui` seguirá estas fases incrementales al construir el proyecto:

### Fase 1: Fundamentos
- Tokens Tipados (Colors, Typography, Spacing).
- Configuración de Tailwind y ThemeProvider.

### Fase 2: Atómicos (Core)
- Button, Input base.
- Card, Badge, Modal, Dialog, Toast.

### Fase 3: Específicos Financieros
- MoneyInput (con formateador dinámico de Big.js).
- CurrencyInput / Select.
- ProgressIndicator.
- DataTable (Para listas de transacciones).
- DatePicker & Calendar.

### Fase 4: Dashboards y Visualización
- Dashboard Widgets.
- Balance Cards.
- Budget Components.
- Charts y Trend Indicators.

---

*Documento 06 de 07 — MyMoney Design System v1.1 — Julio 2026*
