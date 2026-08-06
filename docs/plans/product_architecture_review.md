# MyMoney — Revisión Arquitectónica y Evolución del Producto
> **Versión**: 2.0.0 — Agosto 2026
> **Estado**: ✅ APROBADO — Decisiones confirmadas por el usuario
> **Alcance**: Full-Stack, Dominio, UX, Design System

---

## 📋 Decisiones de Diseño Aprobadas

| ID | Pregunta | Decisión |
|---|---|---|
| **D-01** | ¿Fondos reservados relacionados con categorías? | ✅ `category_id` opcional en árbol existente |
| **D-02** | ¿Cómo modelar Dinero de Terceros? | ✅ Flag `is_third_party` en `Transaction` |
| **D-03** | ¿Modo de color predeterminado? | ✅ Seguir `prefers-color-scheme` del SO |
| **D-04** | ¿Librería de gráficos? | ✅ `recharts` — ligero, React-first |
| **D-05** | ¿Cuándo implementar Transferencias? | ✅ **Fase A** — es core del sistema |
| **D-06** | ¿Reglas automáticas en el plan? | ✅ Sí, en plan con baja prioridad (Fase G) |
| **D-07** | ¿Estilo visual? | ✅ Minimalista denso — Linear/Raycast/Stripe/Vercel |
| **D-08** | ¿Proceso de diseño? | ✅ **Wireframes primero, código después** |
| **D-09** | ¿Dashboard reactivo en tiempo real? | ✅ React Query invalidaciones inmediatas, sin refresh |
| **D-10** | ¿Centro de Insights Financieros? | ✅ Sí — conclusiones automáticas del backend |
| **D-11** | ¿Notification Center? | ✅ Sí — en MVP v1.0 |
| **D-12** | ¿Timeline financiero? | ✅ Sí — línea temporal por cuenta/categoría/meta |
| **D-13** | ¿Financial Health Score? | ✅ Sí — indicador propio 0-100 por subcategoría |
| **D-14** | ¿Búsqueda global Ctrl+K? | ✅ Sí — en MVP v1.0 |
| **D-15** | ¿Dashboard configurable (drag & drop)? | ✅ En v2.0 — post MVP |
| **D-16** | ¿Instrumentos de pago? | ✅ `FinancialInstrument` (modelo ampliado) + catálogo `Merchant` |
| **D-17** | ¿Módulo de Deudas (Liabilities)? | ✅ Sí — impacta cálculo de patrimonio neto |
| **D-18** | ¿Módulo de Activos (Assets)? | ✅ Sí — Patrimonio = Activos + Cuentas − Deudas |
| **D-19** | ¿Objetivos Financieros (nivel superior a metas)? | ✅ Sí — `FinancialObjective` agrupa `Goal[]` |
| **D-20** | ¿Simulador Financiero? | ✅ Sí — sin modificar datos reales |

---

## 🎯 Objetivo de Calidad del Producto

> [!IMPORTANT]
> Este documento define el **estándar mínimo de calidad** para cada pantalla, componente y endpoint. No es un MVP que simplemente funciona. Es un producto cuya calidad técnica y visual debe ser comparable con aplicaciones comerciales.

### Lo que NO estamos construyendo

| ❌ No queremos | ✅ Queremos |
|---|---|
| Un CRUD de finanzas | Una plataforma financiera inteligente |
| Pantallas que muestran datos | Pantallas que responden preguntas |
| Funcionalidad básica | Software de nivel comercial |
| Un panel administrativo genérico | Un asistente financiero personal |
| Un proyecto universitario | Comparable con Copilot Money / Monarch Money / YNAB |
| Templates comprados | Sistema propio con identidad visual consistente |

### Estándar de Calidad por Área

| Área | Estándar Mínimo |
|---|---|
| **Visual** | Primera impresión de software premium. No hay pantalla "fea" |
| **UX** | Cero estados muertos. Todo tiene loading, empty, error state |
| **Performance** | Transiciones <300ms, datos en caché vía React Query |
| **Consistencia** | Cada pantalla se siente del mismo sistema |
| **Código** | DDD + Clean Arch + FSD + Atomic Design. Sin shortcuts |
| **Dominio** | Reglas financieras correctas. El sistema no miente sobre el dinero |

---

## 🧠 Centro de Insights Financieros

> [!NOTE]
> Esta es una de las diferenciaciones más importantes del producto. Convierte MyMoney de un registrador de movimientos en un **asistente financiero**.

### Concepto

No solo mostrar datos — **generar conclusiones automáticamente** basadas en patrones del historial financiero del usuario.

### Ejemplos de Insights

| Categoría | Ejemplo de Insight |
|---|---|
| **Gasto comparativo** | "Este mes gastaste un 18% más en restaurantes que el mes pasado." |
| **Alerta de presupuesto** | "Si mantienes este ritmo, excederás el presupuesto de transporte en 6 días." |
| **Proyección de meta** | "Podrías alcanzar tu meta de Laptop 12 días antes si aumentas el ahorro en $20/mes." |
| **Actividad inusual** | "Hace 3 meses que no registras ingresos en la Cuenta Ahorro." |
| **Composición de gastos** | "Las suscripciones representan el 14% de tus gastos fijos este mes." |
| **Patrón detectado** | "Tus gastos en comida aumentan los viernes y sábados." |
| **Riesgo de meta** | "A este ritmo no alcanzarás la meta de Vacaciones antes de diciembre." |
| **Positivo** | "¡Este mes ahorraste más que en cualquier otro mes del año!" |

### Implementación Técnica

Los insights se generan en el backend (`InsightsService`) y se exponen en un endpoint dedicado:

```
GET /api/v1/insights?limit=5   → Top 5 insights del momento
GET /api/v1/insights/all       → Todos los insights generados
```

Cada insight tiene:

```ts
interface Insight {
  id: string;
  type: 'WARNING' | 'OPPORTUNITY' | 'ACHIEVEMENT' | 'PATTERN' | 'ALERT';
  title: string;           // "Excederás tu presupuesto de transporte"
  description: string;     // Texto completo legible
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  entity_type?: string;    // 'BUDGET' | 'GOAL' | 'TRANSACTION' | 'ACCOUNT'
  entity_id?: string;
  action_url?: string;     // Ruta del frontend para ir directo al recurso
  generated_at: string;
}
```

En el Dashboard, los insights aparecen como un panel lateral o panel inferior compacto. No son notificaciones intrusivas — son **observaciones inteligentes** presentadas como texto legible.

### Reglas de Generación

- Los insights se regeneran al cargar el Dashboard y después de cada transacción importante.
- Máximo 5 insights visibles en el Dashboard al mismo tiempo.
- Los insights con `severity: HIGH` siempre aparecen primero.
- Los insights de tipo `ACHIEVEMENT` (logros positivos) siempre están presentes — balance psicológico.
- El usuario puede descartar un insight individualmente.

### Fase de Implementación

Los Insights van en la **Fase B** (junto al rediseño del Dashboard). Son la diferencia entre un Dashboard pasivo y un Dashboard inteligente.

---

## 🏠 Filosofía del Dashboard

### El Dashboard como Centro Absoluto

El Dashboard debe ser el corazón de la aplicación. El objetivo es que el usuario pueda **permanecer en el Dashboard el 90% del tiempo** sin necesidad de navegar a otras pantallas para entender su situación financiera.

### Preguntas que el Dashboard Debe Responder

El Dashboard no muestra datos — **responde preguntas específicas**:

| Pregunta | Dónde se responde |
|---|---|
| ¿Cuánto dinero puedo gastar hoy? | Bloque 1 — Disponible Libre (prominente) |
| ¿Qué cuentas están creciendo? | Bloque 1 — indicador de tendencia por cuenta |
| ¿Qué presupuesto está en riesgo? | Bloque 3 — badge de velocidad ámbar/rojo |
| ¿Qué meta voy a cumplir primero? | Bloque 4 — ordenado por fecha más próxima |
| ¿Qué gasto se salió de control? | Centro de Insights |
| ¿Qué pagos vienen en los próximos días? | Bloque 1 — fondos reservados con due_date |
| ¿Cuánto dinero realmente me pertenece? | Bloque 1 — Patrimonio Neto |
| ¿Qué cambió desde ayer? | Centro de Insights |

### Dashboard Vivo — Reactivo en Tiempo Real

> [!IMPORTANT]
> El Dashboard **nunca debe requerir refresh manual**. Cada acción del usuario invalida automáticamente las queries de React Query afectadas.

```
Usuario crea transacción
  → invalidateQueries(['transactions'])
  → invalidateQueries(['dashboard', 'summary'])
  → invalidateQueries(['budgets', 'summary'])
  → invalidateQueries(['accounts'])
  → Dashboard se actualiza en <500ms sin reload
```

Árbol de invalidaciones por acción:

| Acción | Queries Invalidadas |
|---|---|
| Crear/editar/eliminar transacción | `transactions`, `dashboard`, `budgets`, `accounts` |
| Crear/editar cuenta | `accounts`, `dashboard` |
| Crear/editar presupuesto | `budgets`, `dashboard` |
| Agregar progreso a meta | `goals`, `dashboard` |
| Crear fondo reservado | `reserved-funds`, `dashboard` |

### Jerarquía Visual del Dashboard

No todas las tarjetas tienen la misma importancia. El tamaño de cada bloque debe reflejar su prioridad:

```
NIVEL 1 — Prominente, grande (60% del viewport en desktop)
  └── Disponible Libre

NIVEL 2 — Importante, bien visible (30% del viewport)
  ├── Flujo mensual (gráfico)
  └── Desglose de patrimonio

NIVEL 3 — Información de contexto
  ├── Presupuestos activos (con alertas)
  └── Metas de ahorro (con proyección)

NIVEL 4 — Soporte y referencia
  ├── Actividad reciente
  ├── Centro de Insights
  └── Estadísticas secundarias
```

---

## 📱 Layout Adaptativo (Adaptive Layout)

> [!NOTE]
> No es solo "responsive" (columnas que se apilan en móvil). Es un layout que **reorganiza inteligentemente la información** según el ancho disponible, mostrando más widgets en pantallas más grandes.

### Breakpoints y Comportamiento

| Viewport | Columnas | Filas | Qué se muestra |
|---|---|---|---|
| **1280px** (HD) | 3 cols | 3 filas | Dashboard completo base — 6 bloques principales |
| **1536px** (QHD) | 3-4 cols | 2 filas | Gráfico más ancho + insights sidebar visible |
| **1920px** (Full HD wide) | 4 cols | 2 filas | Widgets adicionales: top categorías, tendencias |
| **2560px** (UltraWide) | 5 cols + panel | 2 filas | Panel lateral adicional con detalles expandidos |
| **< 1024px** (tablet) | 2 cols | Scroll | Layout simplificado, solo métricas clave |
| **< 768px** (mobile) | 1 col | Scroll | Vista móvil priorizada |

### Grid del Dashboard en 1280px

```
┌──────────────────────┬──────────┬──────────┬──────────┐
│  Disponible Libre    │ Ingresos │  Gastos  │  Neto    │
│  (span-2)            │          │          │          │
└──────────────────────┴──────────┴──────────┴──────────┘
┌─────────────────────────────────┬───────────────────────┐
│   Flujo Mensual (chart)         │  Patrimonio Desglose  │
│   (span-2)                      │  (span-1)             │
└─────────────────────────────────┴───────────────────────┘
┌──────────────┬──────────────┬───────────────────────────┐
│ Presupuestos │    Metas     │    Actividad + Insights    │
│  (span-1)    │  (span-1)   │       (span-1)             │
└──────────────┴──────────────┴───────────────────────────┘
```

### Grid del Dashboard en 1920px

```
┌────────────────────────────────────────────────────────────────┐
│ Disponible  │ Ingresos │ Gastos │ Neto │ Patrimonio │ Insights  │
└────────────────────────────────────────────────────────────────┘
┌───────────────────────────┬────────────┬───────────────────────┐
│   Flujo Mensual (chart)   │ Presupuest │ Metas + Actividad     │
│   (span-3)                │ (span-1)  │ (span-2)              │
└───────────────────────────┴────────────┴───────────────────────┘
```

---

## ✨ Microinteracciones

Toda interacción debe sentirse premium. No hay pantallas "muertas".

### Catálogo de Microinteracciones Requeridas

| Elemento | Microinteracción |
|---|---|
| **Carga inicial** | Skeletons animados (pulse) que reflejan el layout real |
| **Números financieros** | Counter animation al cargar (0 → valor final, 600ms) |
| **Progress bars** | Animación de llenado al montar el componente (ease-out, 800ms) |
| **Rings de metas** | Stroke-dasharray animation al cargar |
| **Hover en cards** | `translateY(-1px)` + sombra sutil, 150ms ease |
| **Hover en filas de tabla** | Background slate-800/50 con transición 100ms |
| **Botones primarios** | Scale 0.98 on press, color shift on hover |
| **Alertas / Insights** | Slide-in desde la derecha, 200ms |
| **Toast notifications** | Slide-up desde abajo, auto-dismiss 4s |
| **Eliminación de item** | Slide-out + height collapse, 200ms |
| **Tooltips** | Fade-in 100ms, fade-out 150ms |
| **Estados vacíos** | Ilustración + texto contextual + CTA. Nunca pantalla en blanco |
| **Estados de error** | Mensaje claro + botón retry + no perder el layout |
| **Loading de acciones** | Spinner en el botón mismo, no overlay de pantalla completa |

### Principios de Animación

- **Duración máxima**: 300ms para la mayoría de transiciones. 600ms para counters.
- **Easing**: `ease-out` para entradas, `ease-in` para salidas.
- **Respetar `prefers-reduced-motion`**: Todas las animaciones deben deshabilitarse si el usuario lo prefiere.
- **No bloquear**: Las animaciones son cosméticas. Nunca bloquean la interacción.

---

## 🧱 Sistema de Componentes — Reglas Absolutas

> [!CAUTION]
> Estas son reglas de arquitectura del proyecto. Violarlas introduce deuda técnica irreversible.

### Reglas del Design System

1. **Prohibido**: Crear componentes visuales dentro de `features/` o `pages/`. Todo componente reutilizable vive en `@mymoney/ui`.
2. **Prohibido**: HTML nativo (`<button>`, `<input>`, `<select>`, `<textarea>`) fuera de `packages/ui/src/components/`.
3. **Prohibido**: Clases de Tailwind hardcodeadas de color en features (`text-gray-600`, `bg-white`, etc.). Solo tokens semánticos.
4. **Prohibido**: Iconos que no vengan del componente `<Icon />` del registry.
5. **Obligatorio**: Cada componente nuevo en `@mymoney/ui` debe tener su Storybook story.
6. **Obligatorio**: Cambiar un componente del Design System impacta automáticamente toda la aplicación.

### Jerarquía de Componentes

```
packages/ui/src/components/
├── core/           ← Átomos: Button, Input, Label, Icon, Badge, Skeleton, Tooltip
├── composite/      ← Moléculas: MoneyInput, StatCard, ProgressBar, GoalProgress
└── layout/         ← Organismos: DashboardGrid, Sidebar, PageHeader

apps/web/src/
├── entities/       ← Solo tipos, hooks y queries. Sin JSX.
├── features/       ← Formularios, lógica de negocio. Usa @mymoney/ui.
├── widgets/        ← Secciones de página. Compone features + entities.
└── pages/          ← Ensambla widgets. Sin lógica propia.
```

---



## 🎨 Filosofía de Diseño (Aprobada)

> [!IMPORTANT]
> **Wireframes primero, código después.** Antes de implementar cualquier rediseño de pantallas, se generarán y aprobarán mockups visuales. No se escribe código hasta que la distribución visual esté confirmada.

### Estilo Visual

La aplicación debe inspirarse en productos SaaS modernos de referencia:

| Producto | Qué tomar prestado |
|---|---|
| **Linear** | Densidad de información, tipografía apretada, sidebar compacto |
| **Raycast** | Rapidez percibida, comandos minimalistas, microinteracciones |
| **Stripe Dashboard** | Layout de métricas, gráficos integrados, paleta sobria |
| **Vercel Dashboard** | Cards compactas, estado de sistema claro, grids inteligentes |
| **GitHub** | Tablas densas pero legibles, buen uso del ancho |
| **Revolut / Monarch Money** | Presentación financiera profesional, jerarquía de datos |

**No se copia ninguno. Se toma lo mejor de todos.**

### Sensación Objetivo

La aplicación debe sentirse:

- **Elegante y premium** — no infantil, no colorida en exceso
- **Rápida** — sin animaciones pesadas, transiciones suaves
- **Densa pero legible** — mucha información, excelente contraste
- **Consistente** — cada pantalla se siente parte del mismo sistema
- **Profesional** — nivel software SaaS, no app de finanzas doméstica

### Densidad de Información: Media-Alta

```
❌ Apple / Notion — mucho espacio vacío, poca info por pantalla
❌ Saturado / colorido — abrumador, difícil de leer
✅ Linear / Stripe / Vercel — denso, eficiente, cada píxel justificado
```

### Reglas de Diseño

1. **Cada píxel debe justificar su existencia.** Si un espacio no mejora legibilidad o UX, se aprovecha para mostrar información útil.
2. **Grids responsivos inteligentes** — columnas adaptativas, no una lista vertical infinita.
3. **Tarjetas de tamaño variable** — no todas iguales. Algunas métricas son más importantes que otras.
4. **Sin padding exagerado.** Cards compactas con buena jerarquía interna.
5. **Sin márgenes excesivos** que desperdicien el ancho útil de la pantalla.
6. **Layouts asimétricos** cuando añaden valor (ej. panel principal + sidebar de contexto).
7. **Información importante visible sin scroll excesivo** — el dashboard debe mostrarse casi completo en un viewport de 1280px.

### Lo que NO queremos

- ❌ Tarjetas gigantes con poco contenido
- ❌ Una columna enorme con cards una debajo de otra
- ❌ Grandes zonas vacías por moda de diseño
- ❌ Interfaz extremadamente colorida
- ❌ Interfaz aburrida o genérica
- ❌ Sensación de aplicación web de 2015

### Dashboard Objetivo

El Dashboard debe permitir ver sin scroll (en 1280px+):

- Balance disponible real (prominente)
- Flujo del mes (ingresos / gastos / delta)
- Top 3-5 presupuestos activos con progreso
- Top 3 metas de ahorro con proyección
- Transacciones recientes (al menos 5)
- Alertas activas

Usando un grid inteligente — no una lista vertical.

---



## 1. Estado Actual del Proyecto

### 1.1 Módulos Existentes

| Módulo | Backend | Frontend | Observaciones |
|---|---|---|---|
| Auth (Login/Logout) | ✅ | ✅ | Sesión HttpOnly, JWT |
| Cuentas | ✅ | ✅ | CRUD completo, soft delete |
| Categorías | ✅ | ✅ | Árbol 2 niveles, is_system |
| Transacciones | ✅ | ✅ | INCOME/EXPENSE, paginación |
| Presupuestos | ✅ | 🟡 | Backend sólido, UI básica |
| Metas de ahorro | ✅ | 🟡 | Backend sólido, UI básica |
| Design System | ✅ | 🟡 | Compilado, integración incompleta |
| Dashboard | 🟡 | 🟡 | Solo datos, sin inteligencia financiera |
| **Transferencias** | ❌ | ❌ | **Módulo crítico ausente** |

### 1.2 Deudas Técnicas Detectadas

| Problema | Causa Raíz | Impacto |
|---|---|---|
| `accounts.map is not a function` | `ListAccountsUseCase` retorna `{ data: [] }` pero frontend esperaba `[]` | Alto — **RESUELTO** ✅ |
| `categories.map is not a function` | `CategoriesController` retorna `{ data: [] }` | Alto — **RESUELTO** ✅ |
| `budgets.map is not a function` | `BudgetsController` retorna `{ data: [] }` | Alto — **RESUELTO** ✅ |
| `Icon "X" not found` | Registry incompleto | Medio — **RESUELTO** ✅ |
| `<select>` nativo en formularios | Violación regla "no HTML nativo fuera de @mymoney/ui" | Medio — **RESUELTO** ✅ |
| `api/v1` vs `api` discrepancia | `main.ts` y `.env` inconsistentes | Alto — **RESUELTO** ✅ |
| Variables CSS circulares | `--color-background: var(--color-background)` | Medio — **RESUELTO** ✅ |
| `AccountsSummaryWidget` suma monedas distintas | Viola `ACC-R05`: no consolidar multi-moneda | Medio — **PENDIENTE** |
| Contratos API inconsistentes | Controllers retornan shapes distintos | Alto — **PENDIENTE** |
| **Módulo de Transferencias ausente** | No existe ninguna implementación | Crítico — **PENDIENTE** |
| Design System — tokens light mode | Inputs negros en modo claro | Medio — **PENDIENTE** |

### 1.3 Fortalezas de la Arquitectura

- **DDD + Clean Architecture**: Entidades puras, repositorios desacoplados, casos de uso como única orquestación.
- **Feature Sliced Design**: `entities / features / widgets / pages` correctamente separado.
- **Prisma Schema bien modelado**: Soft delete, audit logs, balance projections, feature flags.
- **Domain Events con EventEmitter2**: Propagación automática de cambios de balance y presupuesto.
- **Money Value Object**: Usa `big.js`, nunca floats. 15,4 de precisión decimal.
- **`@mymoney/ui` como paquete independiente**: Design System desacoplado del app.

---

## 2. Problema Central del Dashboard Actual

El Dashboard solo suma balances de cuentas. No responde ninguna pregunta financiera real:

```
Dashboard actual:
  Balance Total = Suma(account.current_balance)
  ❌ No distingue dinero disponible vs comprometido
  ❌ No distingue dinero de terceros
  ❌ No muestra progreso real de metas
  ❌ No muestra velocidad de gasto en presupuestos
  ❌ No proyecta cierre del mes
  ❌ Mezcla monedas distintas en la suma (viola ACC-R05)
```

---

## 3. Nuevos Conceptos de Dominio

### 3.1 Dinero Reservado (`ReservedFund`)

Dinero que está en una cuenta pero está comprometido para un gasto futuro conocido.

**Decisión D-01**: Los fondos reservados se relacionan opcionalmente con una categoría existente.

**Ejemplos**: Renta → categoría "Vivienda", Luz → categoría "Servicios", Internet → categoría "Servicios".

**Diferencia con Presupuesto**: Un presupuesto controla el gasto del período. Una reserva es dinero que ya "no existe" para gastos cotidianos, aunque aún no se haya pagado.

**Modelo de datos propuesto**:

```prisma
model ReservedFund {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id       String    @db.Uuid
  account_id    String    @db.Uuid
  category_id   String?   @db.Uuid   // ← D-01: relación opcional con árbol de categorías
  name          String    @db.VarChar(100)
  amount        Decimal   @db.Decimal(15, 4)
  currency      String    @db.Char(3)
  due_date      DateTime? @db.Date
  is_recurring  Boolean   @default(false)
  recurring_day Int?      // Día del mes (1-28)
  status        String    @default("ACTIVE") // ACTIVE | PAID | CANCELLED
  icon          String?   @db.VarChar(50)
  color         String?   @db.Char(7)
  created_at    DateTime  @default(now()) @db.Timestamptz
  updated_at    DateTime  @updatedAt @db.Timestamptz
  @@map("reserved_funds")
}
```

**Cálculo en Dashboard**:
```
Dinero Reservado = Suma(reserved_funds WHERE status = 'ACTIVE')
Dinero Disponible = current_balance − dinero_reservado − dinero_bloqueado − dinero_terceros
```

---

### 3.2 Dinero Bloqueado (`BlockedFund`)

Dinero intocable aunque esté físicamente en la cuenta.

**Ejemplos**: Fondo de emergencia, ahorros intocables, caja chica.

**Diferencia con Metas**: Una meta tiene objetivo y progreso. Un fondo bloqueado simplemente no debe tocarse hasta decisión explícita del usuario.

```prisma
model BlockedFund {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String   @db.Uuid
  account_id String   @db.Uuid
  name       String   @db.VarChar(100)
  amount     Decimal  @db.Decimal(15, 4)
  currency   String   @db.Char(3)
  reason     String?  @db.VarChar(500)
  is_active  Boolean  @default(true)
  created_at DateTime @default(now()) @db.Timestamptz
  updated_at DateTime @updatedAt @db.Timestamptz
  @@map("blocked_funds")
}
```

---

### 3.3 Dinero de Terceros — Flag en Transaction

**Decisión D-02**: El dinero de terceros se modela como un flag `is_third_party` directamente en la entidad `Transaction`, no como una tabla separada.

**Ventajas de esta decisión**:
- No rompe el invariante "todo movimiento pertenece a una cuenta" (G-02).
- Aprovecha el historial existente de transacciones.
- Más simple que una tabla separada.
- Permite soft delete y auditoría automática.

**Campos a agregar en `Transaction`**:
```prisma
// Agregar a model Transaction:
  is_third_party Boolean @default(false)
  third_party_owner String? @db.VarChar(100)  // A quién pertenece el dinero
  third_party_note  String? @db.VarChar(500)
```

**Cálculo en Dashboard**:
```
Dinero de Terceros =
  Suma(transactions WHERE is_third_party = true AND type = 'INCOME' AND deleted_at IS NULL)
  − Suma(transactions WHERE is_third_party = true AND type = 'EXPENSE' AND deleted_at IS NULL)
```

**Regla de negocio**:
- Las transacciones marcadas como `is_third_party` **NUNCA** se suman al patrimonio neto del usuario.
- Aparecen en una sección separada del Dashboard: "Dinero administrado".

---

### 3.4 Mejoras al Modelo de Metas (`Goal`)

El modelo actual es funcional pero le faltan campos para una experiencia profesional.

**Campos a agregar — todos opcionales (migración no destructiva)**:

```prisma
// Agregar a model Goal:
  description     String?  @db.VarChar(1000)
  priority        Int      @default(3)      // 1=Alta 2=Media 3=Baja
  color           String?  @db.Char(7)
  icon            String?  @db.VarChar(50)
  account_id      String?  @db.Uuid          // Cuenta donde se guarda el dinero
  monthly_target  Decimal? @db.Decimal(15, 4) // Cuánto ahorrar mensualmente
```

**Cálculos derivados** (en el DTO, sin persistir):
- `progress_percentage` → `(current_amount / target_amount) * 100`
- `days_remaining` → `target_date - today`
- `daily_required` → `(target_amount - current_amount) / days_remaining`
- `weekly_required` → `daily_required * 7`
- `monthly_required` → `daily_required * 30`

---

### 3.5 Fórmula de Patrimonio Neto

```
Patrimonio Neto =
  Suma(account.current_balance)
  − Suma(reserved_funds.amount WHERE status = 'ACTIVE')
  − Suma(blocked_funds.amount WHERE is_active = true)
  − Dinero de Terceros (calculado de transactions.is_third_party)

Liquidez Real =
  Patrimonio Neto
  − Suma(goals.current_amount)   // Dinero comprometido en metas
```

> [!CAUTION]
> Todo cálculo de patrimonio y liquidez DEBE agruparse por moneda. Nunca sumar monedas distintas sin conversión explícita (ACC-R05).

---

## 4. Rediseño del Dashboard

### 4.1 Estructura en 6 Bloques

```
Dashboard
├── [Header] Buenos días, [nombre] • [fecha] • Resumen rápido
│
├── [Bloque 1] Situación Financiera Real
│   ├── Saldo Total de Cuentas (por moneda)
│   ├── − Dinero Reservado
│   ├── − Dinero Bloqueado
│   ├── − Dinero de Terceros
│   └── ► DISPONIBLE LIBRE (prominente, grande, en color)
│
├── [Bloque 2] Flujo del Mes Actual
│   ├── Ingresos del mes (+)
│   ├── Gastos del mes (−)
│   ├── Balance neto del mes
│   └── Comparativa vs mes anterior (flecha ▲▼ + %)
│
├── [Bloque 3] Presupuestos Activos (Top 3-5)
│   ├── ProgressBar por categoría
│   ├── Porcentaje ejecutado + monto restante
│   └── Indicador de velocidad: 🔴 Acelerado / 🟡 Normal / 🟢 Lento
│
├── [Bloque 4] Metas de Ahorro (Top 3 por prioridad)
│   ├── ProgressBar de avance
│   ├── Días restantes
│   └── "Necesitas ahorrar $X al mes para cumplirla"
│
├── [Bloque 5] Transacciones Recientes
│   └── Últimas 5-10 transacciones con categoría e icono
│
└── [Bloque 6] Alertas Activas
    ├── Presupuestos al/cerca del alert_threshold
    ├── Metas con target_date próxima
    └── Dinero de terceros pendiente de devolución
```

### 4.2 Preguntas que el Dashboard Responderá

| Pregunta | Fuente |
|---|---|
| ¿Cuánto puedo gastar hoy? | `Total − Reservado − Bloqueado − Terceros` |
| ¿Cuánto gasté este mes? | `SUM(transactions WHERE type=EXPENSE AND date IN mes)` |
| ¿Cuánto ingresó este mes? | `SUM(transactions WHERE type=INCOME AND date IN mes)` |
| ¿Cómo voy en mis metas? | `Goal.progress_percentage + monthly_required` |
| ¿Mis presupuestos están bien? | `Budget.executed / Budget.amount vs alert_threshold` |
| ¿Cuánto me pertenece realmente? | Patrimonio Neto calculado |

---

## 5. Presupuestos Inteligentes

### 5.1 Funcionalidades a Agregar

| Feature | Estado Actual | Propuesta |
|---|---|---|
| Velocidad de gasto | ❌ | Gasto diario actual vs gasto diario esperado |
| Proyección de cierre | ❌ | "A este ritmo, cerrarás con $X restante/excedido" |
| Comparativa histórica | ❌ | vs mes anterior, vs promedio 3 meses |
| Alertas activas | 🟡 | `alert_threshold` existe, notificaciones aún no |
| Rollover de saldo | ❌ | ¿El saldo no usado pasa al siguiente período? |

### 5.2 Nuevos Endpoints

```
GET /api/v1/budgets/summary           → Resumen del mes con velocidad y proyección
GET /api/v1/budgets/:id/analytics     → Historial y comparativa de períodos anteriores
```

### 5.3 Campos opcionales a agregar en Budget

```prisma
  rollover_unused Boolean @default(false)  // ¿Saldo no usado pasa al siguiente mes?
  notes           String?
```

---

## 6. Transferencias (Fase A — Crítico)

**Decisión D-05**: Las transferencias se implementan en Fase A — son core del sistema financiero.

### 6.1 Estado Actual

El schema tiene `transfer_pair_id` en `Transaction`. Las reglas TRF-R01 a TRF-R05 están documentadas en `02-business-rules.md`. Pero **no existe ninguna implementación**:

- ❌ `CreateTransferUseCase`
- ❌ `TransferController`
- ❌ `TransferModule`
- ❌ UI de transferencia

### 6.2 Reglas de Negocio (ya documentadas, a respetar)

- **TRF-R01**: Una transferencia crea exactamente 2 transacciones: EXPENSE en origen, INCOME en destino.
- **TRF-R02**: Atomicidad no negociable — o ambas se crean, o ninguna.
- **TRF-R03**: Origen ≠ Destino.
- **TRF-R04**: Transferencias entre monedas distintas permitidas (el usuario declara montos).
- **TRF-R05**: Eliminar una transferencia elimina ambos movimientos atómicamente.

---

## 7. Design System v2

### 7.1 Decisión D-03: prefers-color-scheme

El modo de color predeterminado seguirá la preferencia del sistema operativo (`prefers-color-scheme: dark/light`). Los tokens deben estar correctamente contrastados **en ambos modos**.

### 7.2 Problemas a Corregir

| Problema | Solución |
|---|---|
| Inputs negros en modo claro | Auditar `--color-input-bg` en `:root` (light) |
| Labels invisibles en modo claro | Auditar `--color-text-primary` en `:root` |
| Fondo de página en modo claro muy oscuro | Ajustar `--color-background` en `:root` a Slate 50 |

### 7.3 Tokens Propuestos

```css
:root {
  --color-background: #F8FAFC;        /* Slate 50 */
  --color-surface: #FFFFFF;
  --color-surface-2: #F1F5F9;         /* Slate 100 */
  --color-text-primary: #0F172A;      /* Slate 900 */
  --color-text-secondary: #475569;    /* Slate 600 */
  --color-text-muted: #94A3B8;        /* Slate 400 */
  --color-border-subtle: #E2E8F0;     /* Slate 200 */
  --color-border: #CBD5E1;            /* Slate 300 */
  --color-input-bg: #FFFFFF;
  --color-input-border: #CBD5E1;
  --color-input-text: #0F172A;
  --color-input-placeholder: #94A3B8;
  --color-input-focus: #3B82F6;
}

.dark {
  --color-background: #020617;        /* Slate 950 */
  --color-surface: #0F172A;           /* Slate 900 */
  --color-surface-2: #1E293B;         /* Slate 800 */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-border-subtle: #1E293B;
  --color-border: #334155;
  --color-input-bg: #1E293B;
  --color-input-border: #334155;
  --color-input-text: #F8FAFC;
  --color-input-placeholder: #64748B;
  --color-input-focus: #60A5FA;
}
```

### 7.4 Nuevos Componentes Necesarios

| Componente | Descripción | Prioridad |
|---|---|---|
| `ProgressBar` | Barra de progreso animada | Alta |
| `StatCard` | Tarjeta de métrica con valor y tendencia | Alta |
| `AlertBanner` | Banner de alerta no invasivo | Alta |
| `EmptyState` | Estado vacío con ilustración y CTA | Alta |
| `Skeleton` | Loading skeletons para tablas y cards | Media |
| `Tooltip` | Tooltip con contexto | Media |
| `DatePicker` | Selector de fecha accesible | Media |

---

## 8. Estandarización del Contrato API

> [!WARNING]
> Los controllers retornan shapes inconsistentes, causando `X.map is not a function` en el frontend. Esta es la deuda técnica más urgente.

**Situación actual**:
```ts
// AccountsController    → { data: Account[] }
// CategoriesController  → { data: Category[] }
// BudgetsController     → { data: Budget[] }
// TransactionsController → { data: Transaction[], total, page, limit }
// GoalsController       → Goal[]  ← diferente a todos
```

**Solución — `ApiResponse<T>` en `packages/shared`**:
```ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}
```

**Interceptor único en el frontend** para desempaquetar:
```ts
apiClient.interceptors.response.use((res) => {
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return { ...res, data: res.data.data };
  }
  return res;
});
```

---

## 9. Roadmap Propuesto — v2.0 (Orden Revisado)

> [!NOTE]
> El Design System v2 va **antes** del Dashboard porque el Dashboard consume `StatCard`, `ProgressBar`, `AlertBanner`, `Skeleton` y `Tooltip`. Construir el DS primero evita retrabajo al ensamblar el Dashboard.

```
FASE A — Corrección técnica (base sólida)
    ↓
FASE B — Design System v2 (fundación visual)
    ↓
FASE C — Dashboard Inteligente + Insights (corazón del producto)
    ↓
FASE D — Fondos (Reservado / Bloqueado / Terceros)
    ↓
FASE E — Metas Mejoradas
    ↓
FASE F — Presupuestos Inteligentes
    ↓
FASE G — Automatizaciones (Post MVP)
```

---

### ✅ Fase A: Corrección Técnica (1-2 semanas)
**Objetivo**: Base técnica sólida. Sin bugs, contratos estables, Transferencias core implementadas.

- [ ] **A-01** Estandarizar `ApiResponse<T>` en todos los controllers
- [ ] **A-02** Interceptor unificado en axios para desempaquetar respuestas
- [ ] **A-03** Corregir `AccountsSummaryWidget` — agrupar por moneda (ACC-R05)
- [ ] **A-04** Módulo de **Transferencias** completo — backend (CreateTransferUseCase) + frontend
- [ ] **A-05** Flag `is_third_party` + `third_party_owner` + `third_party_note` en `Transaction`
- [ ] **A-06** Búsqueda global `Ctrl+K` — estructura base (D-14)
- [ ] **A-07** Acciones rápidas en Dashboard (modal de creación rápida)
- [ ] **A-08** Sistema de Notificaciones — estructura base (D-11)

### ✅ Fase B: Design System v2 (1-2 semanas)
**Objetivo**: Fundación visual completa en ambos modos de color antes de construir el Dashboard.

- [ ] **B-01** Corrección completa de tokens — light mode con contraste correcto (`prefers-color-scheme`)
- [ ] **B-02** Auditar todos los formularios en ambos modos
- [ ] **B-03** `StatCard` — métrica con valor, delta y tendencia
- [ ] **B-04** `ProgressBar` — animada, colores semánticos, variantes
- [ ] **B-05** `AlertBanner` — slide-in, tipos INFO/WARNING/ERROR/SUCCESS
- [ ] **B-06** `EmptyState` — ilustración + texto contextual + CTA
- [ ] **B-07** `Skeleton` — pulse animation, refleja layout real
- [ ] **B-08** `Tooltip` — fade-in, posicionable
- [ ] **B-09** `NotificationBadge` — badge numérico animado
- [ ] **B-10** `CommandPalette` — base del Ctrl+K
- [ ] **B-11** Storybook actualizado con todos los componentes

### ✅ Fase C: Dashboard Inteligente + Insights (2-3 semanas)
**Objetivo**: El Dashboard es el corazón del producto. Responde preguntas, no solo muestra datos.

- [ ] **C-01** Endpoint `/api/v1/dashboard/summary` — patrimonio, disponible, flujo mensual
- [ ] **C-02** Endpoint `/api/v1/dashboard/monthly-flow` — ingresos vs gastos por mes
- [ ] **C-03** `InsightsService` en backend — 8 tipos de insights con reglas
- [ ] **C-04** Endpoint `/api/v1/insights?limit=5`
- [ ] **C-05** Rediseño visual del Dashboard — layout adaptativo (1280 / 1920 / 2560px)
- [ ] **C-06** Gráfico de flujo mensual con recharts
- [ ] **C-07** Panel de Insights integrado en Dashboard
- [ ] **C-08** Sección "Dinero Administrado" para transacciones `is_third_party`
- [ ] **C-09** Timeline Financiero — línea temporal filtrable (D-12)
- [ ] **C-10** Financial Health Score — endpoint + widget en Dashboard (D-13)
- [ ] **C-11** Invalidaciones React Query — árbol completo, Dashboard reactivo (D-09)
- [ ] **C-12** Counter animations para métricas del Dashboard
- [ ] **C-13** Skeletons del Dashboard reflejando el layout real

### ✅ Fase D: Fondos (Reservado / Bloqueado / Terceros) (2-3 semanas)
**Objetivo**: El usuario puede modelar su situación financiera real y el Dashboard la refleja.

- [ ] **D-01** Migración: tablas `reserved_funds`, `blocked_funds`
- [ ] **D-02** CRUD backend con DDD completo para `ReservedFund` y `BlockedFund`
- [ ] **D-03** Fondos reservados vinculados a categorías del árbol (`category_id` opcional)
- [ ] **D-04** UI: Formularios y listados para cada tipo de fondo
- [ ] **D-05** Integrar en cálculo de `Disponible` en `/dashboard/summary`
- [ ] **D-06** Favoritos — sistema de marcado ⭐ para cuentas, metas y presupuestos

### ✅ Fase E: Metas Mejoradas (2 semanas)
**Objetivo**: Las metas muestran inteligencia financiera real y proyección temporal.

- [ ] **E-01** Migración: `description`, `priority`, `color`, `icon`, `account_id` en `goals`
- [ ] **E-02** Calcular y exponer en DTO: `daily_required`, `monthly_required`, `days_remaining`
- [ ] **E-03** UI: Vista de meta con proyección temporal y velocidad de ahorro
- [ ] **E-04** Selector de prioridad, color e icono en formulario
- [ ] **E-05** Historial de aportes por meta

### ✅ Fase F: Presupuestos Inteligentes (2 semanas)
**Objetivo**: Presupuestos con velocidad de gasto, proyección e histórico comparativo.

- [ ] **F-01** Endpoint `/api/v1/budgets/:id/analytics`
- [ ] **F-02** Calcular velocidad de gasto diaria actual vs esperada
- [ ] **F-03** Proyección de cierre del período
- [ ] **F-04** Comparativa vs períodos anteriores
- [ ] **F-05** Alertas activas cuando se supera `alert_threshold`
- [ ] **F-06** `rollover_unused` — saldo no usado pasa al siguiente período

### 🔵 Fase G: Automatizaciones (Post MVP — Baja Prioridad)
**Objetivo**: El sistema toma acciones basado en eventos financieros.

- [ ] **G-01** Tabla `auto_rules` + motor de procesamiento
- [ ] **G-02** UI para crear y editar reglas
- [ ] **G-03** Triggers: `INCOME_RECEIVED`, `BUDGET_THRESHOLD`, `MONTH_END`
- [ ] **G-04** Actions: `MOVE_TO_GOAL`, `RESERVE_AMOUNT`, `ALERT_USER`
- [ ] **G-05** Dashboard configurable — drag & drop de widgets (D-15)

---

## 10. Impacto por Capa

### Base de Datos — Solo cambios no destructivos

| Cambio | Tipo | Riesgo |
|---|---|---|
| `reserved_funds` | Nueva tabla | 🟢 Bajo |
| `blocked_funds` | Nueva tabla | 🟢 Bajo |
| `is_third_party` en `Transaction` | ALTER TABLE + default false | 🟢 Bajo |
| `third_party_owner`, `third_party_note` en `Transaction` | ALTER TABLE + nullable | 🟢 Bajo |
| 5 columnas opcionales en `goals` | ALTER TABLE + defaults | 🟢 Bajo |
| 2 columnas opcionales en `budgets` | ALTER TABLE + defaults | 🟢 Bajo |

### Backend (NestJS)

| Cambio | Estimado |
|---|---|
| Estandarizar `ApiResponse<T>` | 1-2 días |
| Módulo de **Transferencias** completo | 3-5 días |
| Endpoint `/dashboard/summary` | 2-3 días |
| Módulos `ReservedFunds`, `BlockedFunds` | 3-4 días c/u |
| Mejorar `GoalDto` con proyecciones | 1-2 días |
| Endpoint `/budgets/:id/analytics` | 2-3 días |

### Frontend (React + Vite)

| Cambio | Estimado |
|---|---|
| Interceptor unificado axios | 2-4 horas |
| Rediseño Dashboard — 6 bloques | 4-6 días |
| UI Transferencias | 2-3 días |
| UI Fondos Reservados y Bloqueados | 2-3 días c/u |
| Mejoras UI Metas | 2-3 días |
| Gráfico recharts en Dashboard | 1-2 días |

### Design System

| Cambio | Estimado |
|---|---|
| Corrección tokens light mode | 1-2 días |
| StatCard, ProgressBar, AlertBanner | 2-3 días |
| EmptyState, Skeleton, Tooltip | 2-3 días |
| Auditoría Input/Label/Select | 1 día |

---

## 11. Riesgos y Mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Migración DB rompe producción | Baja | Alto | Todas las nuevas columnas/tablas tienen defaults y son opcionales |
| Interceptor axios rompe casos edge | Media | Alto | Implementar con guard `'data' in res.data` antes de estandarizar controllers |
| Transferencias tienen edge cases complejos | Alta | Alto | Implementar TRF-R01 a TRF-R05 con tests E2E completos |
| Design System v2 introduce regresiones | Media | Medio | Branch separado para tokens, validar en Storybook antes de mergear |
| Motor de reglas añade complejidad prematura | Media | Medio | Fase G post-MVP, no bloquea ninguna fase anterior |

---

## 12. Alcance del MVP v1.0

> [!IMPORTANT]
> Definir el MVP evita el desarrollo indefinido sin una versión terminada. Lo que está fuera del MVP puede existir en el backlog, pero no bloquea el lanzamiento v1.0.

### ✅ Incluido en MVP v1.0 (Fases A a F)

| Módulo | Descripción |
|---|---|
| **Auth** | Login, logout, sesión segura |
| **Cuentas** | CRUD completo, soft delete, agrupación por moneda |
| **Transacciones** | INCOME, EXPENSE, TRANSFER, paginación, filtros |
| **Transferencias** | Doble entrada atómica entre cuentas del usuario |
| **Categorías** | Árbol 2 niveles, categorías del sistema |
| **Presupuestos** | CRUD + velocidad de gasto + proyección + alertas |
| **Metas de Ahorro** | CRUD + proyección temporal + prioridad + icono/color |
| **Fondos Reservados** | Compromisos futuros vinculados a categorías |
| **Fondos Bloqueados** | Dinero intocable |
| **Dinero de Terceros** | Flag `is_third_party` en transacciones |
| **Dashboard Inteligente** | 6 bloques, adaptive layout, patrimonio neto, disponible libre |
| **Centro de Insights** | 8 tipos de insights automáticos |
| **Notification Center** | Alertas de presupuesto, metas, transferencias |
| **Timeline Financiero** | Línea temporal filtrable |
| **Financial Health Score** | Score 0-100 con subcategorías |
| **Búsqueda Global** | Ctrl+K — buscar en transacciones, metas, cuentas, etc. |
| **Acciones Rápidas** | Nueva transacción/transferencia/meta/presupuesto desde Dashboard |
| **Favoritos** | Marcar ⭐ cuentas, metas y presupuestos |
| **Design System v2** | Ambos modos de color, todos los componentes documentados |

### ❌ Fuera del MVP v1.0 (Fase G y posterior)

| Feature | Razón |
|---|---|
| Reglas automáticas | Requiere motor de reglas dedicado — complejidad alta |
| Dashboard configurable (drag & drop) | UX avanzada — v2.0 |
| Reconciliación bancaria automática | Requiere OCR/parseo — fase avanzada |
| Proyecciones ML | Requiere historial suficiente — fase avanzada |
| Multiusuario colaborativo | Introduce permisos por recurso — fuera de alcance |
| Conversión automática de monedas | Requiere API de tasas — fuera de alcance |

---

## 13. Nuevas Features del Producto

### 13.1 Sistema de Notificaciones

No solo Insights pasivos. Un **Notification Center** activo con tipos semánticos:

```
🔴 Presupuesto excedido en Alimentación
🟡 Meta "Laptop" al 90% — ¡casi la alcanzas!
🟢 Transferencia de $500 realizada
🔵 Ingreso de $3,200 registrado
⚪ Datos sincronizados correctamente
```

**Modelo de datos**:
```ts
interface Notification {
  id: string;
  type: 'ERROR' | 'WARNING' | 'SUCCESS' | 'INFO' | 'SYSTEM';
  title: string;
  body?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  read_at?: string;
  created_at: string;
}
```

Se muestra como badge numérico en el header y como panel desplegable. Persistido en la base de datos. El usuario puede marcar como leído o descartar.

---

### 13.2 Timeline Financiero

Una línea temporal de todos los eventos financieros del usuario, filtrable por:
- Cuenta
- Categoría
- Meta
- Presupuesto
- Tipo de movimiento

Vista:
```
Hoy — Martes 1 de Agosto
  09:00  +$3,200.00  Nómina  [Cuenta Banco]  🟢
  11:00   −$20.00   Netflix  [Suscripciones]  🔴
  13:00   ↔ $500.00  Transferencia  Banco → Efectivo
  18:00   🔒 Reserva  "Renta" creada: $800

Lunes 31 de Julio
  10:30   −$87.50   Mercado  [Alimentación]  🔴
  ...
```

Usa el mismo endpoint de transacciones con agrupación por fecha. No requiere tabla nueva.

---

### 13.3 Financial Health Score

Un indicador propio (no financiero oficial) que califica la salud financiera del usuario en tiempo real:

```
Score Financiero   87 / 100

  Liquidez          95 / 100  ████████████████████░░░░░
  Presupuestos      82 / 100  ████████████████░░░░░░░░░
  Ahorro            90 / 100  ██████████████████░░░░░░░
  Gastos Variables  75 / 100  ███████████████░░░░░░░░░░
```

**Reglas de cálculo (transparentes y documentadas)**:

| Subcategoría | Cálculo | Máximo |
|---|---|---|
| Liquidez | `Disponible / TotalBalance × 100` | 100 |
| Presupuestos | `100 - promedio(exceso% por presupuesto)` | 100 |
| Ahorro | `GoalProgress promedio` | 100 |
| Gastos Variables | `100 - (GastosVariables / TotalGastos × 100)` | 100 |

El score se calcula en el backend y se expone en `/api/v1/dashboard/health-score`. Se actualiza al cargar el Dashboard.

---

### 13.4 Búsqueda Global (Ctrl+K)

Una paleta de comandos estilo Linear/Raycast que permite buscar en todo el sistema desde cualquier pantalla:

```
┌─────────────────────────────────────────────────┐
│  🔍  Netflix                                     │
├─────────────────────────────────────────────────┤
│  TRANSACCIONES                                  │
│  💸 Netflix — Suscripciones — −$20.00 — 28 Jul  │
│  💸 Netflix — Suscripciones — −$20.00 — 28 Jun  │
│                                                 │
│  METAS                                          │
│  🎯 Laptop Nueva — 72% completada               │
│                                                 │
│  CATEGORÍAS                                     │
│  📂 Entretenimiento > Suscripciones              │
└─────────────────────────────────────────────────┘
```

Atajo: `Ctrl+K` (Windows/Linux) / `⌘+K` (Mac).

Busca en: transacciones, cuentas, metas, presupuestos, categorías, fondos reservados.

Implementado como componente `CommandPalette` en `packages/ui/src/components/core/CommandPalette/`.

---

### 13.5 Acciones Rápidas

Sin navegar a otras páginas. Desde el Dashboard o cualquier pantalla:

```
  [+ Nueva Transacción]  [↔ Transferencia]  [🎯 Meta]  [💰 Presupuesto]
```

Abre un modal compacto con el formulario mínimo necesario. Después de crear, invalida automáticamente las queries del Dashboard.

---

### 13.6 Sistema de Favoritos

El usuario puede marcar como favorito ⭐ cualquier entidad principal:

- ⭐ Cuentas → aparecen primero en el selector de cuentas
- ⭐ Metas → aparecen primero en el Dashboard
- ⭐ Presupuestos → aparecen primero en el widget de presupuestos

**Implementación**: Campo `is_favorite` booleano en `Account`, `Goal` y `Budget`. O una tabla de favoritos genérica:

```prisma
model Favorite {
  id          String @id ...
  user_id     String @db.Uuid
  entity_type String // 'ACCOUNT' | 'GOAL' | 'BUDGET'
  entity_id   String @db.Uuid
  created_at  DateTime @default(now())
  @@unique([user_id, entity_type, entity_id])
  @@map("favorites")
}
```

---

### 13.7 Dashboard Configurable (v2.0 — No MVP)

Permitir que el usuario:
- Mueva widgets (drag & drop)
- Oculte secciones que no usa
- Cambie el tamaño de widgets (S / M / L)
- Guarde su configuración en la DB

Inspiraciones: Notion, Grafana, Home Assistant.

**Implementación futura**: `UserDashboardConfig` en `user_settings` como JSON.

---

## 14. Definition of Done

> [!IMPORTANT]
> Una funcionalidad solo se considera **terminada** cuando cumple **todos** los siguientes criterios. No existe estado intermedio "funciona pero le falta pulido".

### Checklist por Feature

| Criterio | Descripción |
|---|---|
| ✅ **Backend implementado** | Casos de uso, repositorio, controller, DTOs |
| ✅ **Frontend implementado** | Feature, widget, página completa |
| ✅ **Contratos correctos** | `ApiResponse<T>` en backend + desempaquetado en frontend |
| ✅ **Responsive** | Funciona correctamente en 768px, 1280px, 1920px |
| ✅ **Dark Mode** | Todos los tokens semánticos aplicados correctamente |
| ✅ **Light Mode** | Contraste y legibilidad correctos |
| ✅ **Estado de carga** | Skeleton o spinner coherente con el layout |
| ✅ **Estado vacío** | EmptyState con ilustración, texto y CTA |
| ✅ **Estado de error** | Mensaje claro + botón retry |
| ✅ **Accesibilidad básica** | Labels en inputs, navegación por teclado, contraste WCAG AA |
| ✅ **Design System** | Solo componentes de `@mymoney/ui`. Cero HTML nativo en features |
| ✅ **Storybook** | Story creada si el componente es reutilizable |
| ✅ **TypeScript limpio** | `tsc --noEmit` sin errores ni warnings |
| ✅ **React Query** | Invalidaciones correctas después de cada mutación |
| ✅ **Tests** | Al menos un test unitario por caso de uso de dominio |
| ✅ **Sin console.log** | Sin logs de debug en código de producción |
| ✅ **Validación visual** | Revisado visualmente en ambos modos de color |
| ✅ **Documentación** | Caso de uso y endpoints documentados si son nuevos |

### Regla de Oro

> Si una funcionalidad compila pero no pasa el Definition of Done, **no está terminada**.

Esto evita acumular deuda visual y técnica que se percibe al usar la aplicación.

---

## 15. Cambios Arquitectónicos v2.1 — Refinamientos del Dominio

> [!IMPORTANT]
> Estos no son features opcionales. Son **correcciones al modelo de dominio** que si no se incorporan ahora, duplicarán el costo de implementación en el futuro. Deben incorporarse en las fases correspondientes del roadmap.

---

### C-01: Dashboard como Workspace de Widgets

El Dashboard deja de ser una página fija y pasa a ser un **workspace compuesto por widgets reutilizables**. Cada widget es un componente independiente con sus propios datos y ciclo de vida.

**Catálogo de widgets del MVP**:

| Widget | Descripción |
|---|---|
| `MoneySummaryWidget` | Disponible libre, patrimonio, breakdown |
| `CashFlowWidget` | Gráfico de flujo mensual (recharts) |
| `GoalsWidget` | Top metas por prioridad con proyección |
| `BudgetsWidget` | Presupuestos activos con velocidad y alertas |
| `AccountsWidget` | Cuentas con balance y tendencia |
| `InsightsWidget` | Centro de insights financieros |
| `UpcomingPaymentsWidget` | Próximos 15 días — vencimientos y eventos |
| `ThirdPartyMoneyWidget` | Dinero administrado de terceros |
| `SubscriptionsWidget` | Suscripciones activas y costo mensual total |
| `NetWorthWidget` | Patrimonio neto con tendencia histórica |
| `FinancialHealthWidget` | Score 0-100 con subcategorías |
| `QuickActionsWidget` | Acciones rápidas desde el Dashboard |

**Beneficio arquitectónico**: Cada widget puede implementarse, testearse y actualizarse de forma independiente. En v2.0, el usuario puede reordenarlos (D-15).

---

### C-02: Módulo de Transacciones Recurrentes

No crea transacciones automáticamente. **Genera sugerencias** que el usuario acepta, edita u omite. El usuario siempre mantiene el control.

```prisma
model RecurringTransaction {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id          String    @db.Uuid
  account_id       String    @db.Uuid
  category_id      String?   @db.Uuid
  payment_method_id String?  @db.Uuid
  type             String    // INCOME | EXPENSE
  amount           Decimal   @db.Decimal(15, 4)
  currency         String    @db.Char(3)
  description      String    @db.VarChar(500)
  frequency        String    // DAILY | WEEKLY | MONTHLY | YEARLY
  day_of_month     Int?      // 1-28 para MONTHLY
  next_due_date    DateTime  @db.Date
  last_applied_at  DateTime? @db.Timestamptz
  auto_apply       Boolean   @default(false) // false = solo sugerencia
  is_active        Boolean   @default(true)
  merchant_id      String?   @db.Uuid
  created_at       DateTime  @default(now()) @db.Timestamptz
  updated_at       DateTime  @updatedAt @db.Timestamptz
  @@map("recurring_transactions")
}
```

**UX en Dashboard** (widget `UpcomingPaymentsWidget`):
```
┌─ Hoy toca ─────────────────────────────────────────┐
│ Netflix  −$20.00  [Aceptar] [Editar] [Omitir] │
│ Internet −$35.00  [Aceptar] [Editar] [Omitir] │
└─────────────────────────────────────────────┘
```

---

### C-03: Metas de Ahorro — Modelo Mejorado

**Estados extendidos**:

```ts
enum GoalStatus {
  ACTIVE     // En progreso
  PAUSED     // En pausa por decisión del usuario
  COMPLETED  // Alcanzada — inmutable
  CANCELLED  // Cancelada por el usuario
  ARCHIVED   // Archivada — oculta pero conservada
}
```

**Transiciones válidas**:
```
ACTIVE    → PAUSED     ✅
ACTIVE    → COMPLETED  ✅ (cuando current >= target)
ACTIVE    → CANCELLED  ✅
ACTIVE    → ARCHIVED   ✅
PAUSED    → ACTIVE     ✅
PAUSED    → ARCHIVED   ✅
COMPLETED → cualquier  ❌ PROHIBIDO — inmutable
CANCELLED → ACTIVE     ✅ (reactivar)
ARCHIVED  → ACTIVE     ✅ (restaurar)
```

**Campos adicionales a agregar**:
```prisma
// Agregar a model Goal:
  description      String?   @db.VarChar(1000)
  priority         String    @default("MEDIUM") // LOW | MEDIUM | HIGH | CRITICAL
  color            String?   @db.Char(7)
  icon             String?   @db.VarChar(50)
  account_id       String?   @db.Uuid    // Cuenta origen del ahorro
  monthly_target   Decimal?  @db.Decimal(15, 4)
  auto_contribute  Boolean   @default(false)
  is_archived      Boolean   @default(false)
```

---

### C-04: Presupuestos — Control Inteligente

**Campos adicionales**:
```prisma
// Agregar a model Budget:
  soft_limit        Decimal?  @db.Decimal(15, 4) // Alerta temprana (ej. 80%)
  hard_limit        Decimal?  @db.Decimal(15, 4) // Límite absoluto (igual a amount en MVP)
  carry_over        Boolean   @default(false)     // Saldo no usado pasa al siguiente mes
  ignore_refunds    Boolean   @default(false)     // Los reembolsos no cuentan
  ignore_transfers  Boolean   @default(true)      // Las transferencias no afectan el presupuesto
  is_frozen         Boolean   @default(false)     // Presupuesto congelado (no acepta más gastos)
  notes             String?
```

**Reglas de negocio adicionales**:
- `soft_limit` genera alerta visual (amarillo) antes de llegar al `alert_threshold`.
- `hard_limit` es informativo, no bloquea transacciones (BGT-R07 se mantiene).
- `carry_over = true` crea un nuevo presupuesto al finalizar el período sumando el saldo restante.

---

### C-05: Widget de Próximos Eventos

`UpcomingPaymentsWidget` — Muestra los eventos financieros de los próximos 15 días:

```
┌─ Próximos 15 días ──────────────────────────────────┐
│ Hoy       Netflix         −$20.00  🟡 Pendiente │
│ Mañana    Renta           −$800.00 🔴 Urgente   │
│ 3 días   Luz             −$45.00  ⚪️ Reservado │
│ 7 días   Meta: Laptop    −$180.00 💡 Sugerido  │
│ 10 días  Seguro          −$120.00 🕒 Programado│
│ 14 días  Tarjeta Crédito −$350.00 🟠 Estimado  │
└────────────────────────────────────────────└
```

Combina: `reserved_funds.due_date` + `recurring_transactions.next_due_date` + `goals.monthly_target`.

---

### C-06: Financial Center (Expandido)

No solo un Score. Un **panel de salud financiera multidimensional** con tendencia:

```
┌─ Centro Financiero ────────────────────────────────┐
│ Liquidez       95/100  ███████████████████░  ↑ +3    │
│ Patrimonio     $4,820  █████████████░░░░░░░  ↑ +$120 │
│ Ahorro         82/100  ████████████████░░░░  = 0     │
│ Deuda           0/100  ░░░░░░░░░░░░░░░░░░░░  N/A    │
│ Flujo          +$430   ████████████░░░░░░░░  ↓ -$80  │
└────────────────────────────────────────────────┘
```

Cada dimensión tiene valor actual + tendencia (↑↓=). La tendencia se calcula comparando con el mismo período del mes anterior.

---

### C-07: Auditoría Personal

Registrar eventos importantes del usuario en un log de auditoría visible y legible:

```
┌─ Historial de cambios — Cuenta Banco Pichincha ───┐
│ Hace 2 días   Balance cambió de $3,200 → $4,820  │
│ Hace 5 días   Nombre actualizado                   │
│ Hace 1 mes    Moneda cambiada: COP → USD            │
│ Hace 3 meses  Cuenta creada                        │
└────────────────────────────────────────────└
```

La tabla `audit_logs` ya existe en el schema. Lo que falta es:
1. Una UI para ver el historial de cada entidad.
2. Eventos adicionales: `GOAL_MODIFIED`, `BUDGET_CHANGED`, `ACCOUNT_RENAMED`, etc.
3. Exposición en un endpoint: `GET /api/v1/audit-logs?entity_type=ACCOUNT&entity_id=:id`.

---

### C-08: Tipos de Dinero Reservado

En lugar de un único `ReservedFund`, diferenciar por tipo para que la UI pueda mostrarlos de forma visualmente distinta:

```ts
enum ReservedFundType {
  RESERVE       // Reserva genérica (renta, luz, etc.)
  SUBSCRIPTION  // Suscripción recurrente (Netflix, Spotify)
  DEBT          // Deuda pendiente de pago
  INSTALLMENT   // Cuota de un crédito o pago fraccionado
}
```

Agregar campo `fund_type` a `reserved_funds`:
```prisma
  fund_type String @default("RESERVE") // ReservedFundType
```

---

### C-09: Sistema de Tags

Tags como dimensión complementaria a las categorías. La tabla `Tag` ya existe en el schema. Lo que falta es **exponer los tags en la UI** y usarlos como filtro en transacciones, timeline e insights.

```
Transacción: Vuelo a Madrid
  Categoría: Transporte
  Tags: Vacaciones, Europa, Verano 2026

Transacción: Hotel
  Categoría: Alojamiento
  Tags: Vacaciones, Europa, Verano 2026

→ Filtrar por tag "Vacaciones" muestra todo el gasto del viaje
```

**UI requerida**: Selector de tags en el formulario de transacción (input con autocompletar). Creación de tags al vuelo.

---

### C-10: Adjuntos

La tabla `Attachment` ya existe en el schema. Lo que falta es **la UI e integración** en formularios:

- Adjuntar a: Transacciones, Metas, Presupuestos, Transferencias.
- Formatos: PDF, PNG, JPG, WEBP.
- Límite: 5MB por archivo.
- Vista previa en modal.

---

### C-11: AccountType como Enum Completo

El schema actual tiene `type String` con comentario. Formalizar como enum en el dominio:

```ts
enum AccountType {
  CHECKING     // Cuenta corriente bancaria
  SAVINGS      // Cuenta de ahorros
  CASH         // Efectivo
  CREDIT_CARD  // Tarjeta de crédito
  DEBIT_CARD   // Tarjeta de débito vinculada a cuenta
  WALLET       // Billetera digital (PayPal, Nequi, etc.)
  CRYPTO       // Criptomonedas
  INVESTMENT   // Inversión (fondos, acciones)
  LOAN         // Préstamo o crédito (balance negativo)
}
```

Cada tipo tiene reglas propias:
- `CREDIT_CARD` y `LOAN` pueden tener balance negativo.
- `CRYPTO` muestra warning de volatilidad.
- `INVESTMENT` no cuenta en el cálculo de liquidez diaria.

---

### C-12: GoalPriority como Enum (No Número)

En lugar de `priority: Int` (1, 2, 3), usar un enum legible:

```ts
enum GoalPriority {
  LOW       = 'LOW'
  MEDIUM    = 'MEDIUM'
  HIGH      = 'HIGH'
  CRITICAL  = 'CRITICAL'
}
```

En el schema Prisma se almacena como `String` con validación en el dominio. Mucho más legible en logs, DTOs y UI que `1`, `2`, `3`.

---

### C-13: Módulo de Suscripciones

Separado de `ReservedFunds` para generar estadísticas específicas:

```prisma
model Subscription {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String    @db.Uuid
  account_id      String    @db.Uuid
  payment_method_id String? @db.Uuid  // Con qué tarjeta se paga
  merchant_id     String?   @db.Uuid  // Netflix, Spotify, etc.
  name            String    @db.VarChar(100)
  amount          Decimal   @db.Decimal(15, 4)
  currency        String    @db.Char(3)
  billing_day     Int       // Día del mes (1-28)
  frequency       String    @default("MONTHLY") // MONTHLY | YEARLY
  category_id     String?   @db.Uuid
  color           String?   @db.Char(7)
  icon            String?   @db.VarChar(50)
  is_active       Boolean   @default(true)
  trial_ends_at   DateTime? @db.Date
  next_billing_at DateTime  @db.Date
  created_at      DateTime  @default(now()) @db.Timestamptz
  updated_at      DateTime  @updatedAt @db.Timestamptz
  @@map("subscriptions")
}
```

Permite responder: **"¿Cuánto gasto al mes en suscripciones?"**

```
Total mensual en suscripciones: $95.00
  Netflix         $20.00
  Spotify         $10.00
  ChatGPT         $20.00
  Claude          $20.00
  Google One      $3.00
  GitHub Copilot  $10.00
  Hosting         $12.00
```

---

### C-14: PinnedItem Genérico (Favoritos)

En lugar de `is_favorite: Boolean` en cada tabla, una única tabla escalable con soporte de ordenamiento:

```prisma
model PinnedItem {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String   @db.Uuid
  entity_type String   // 'ACCOUNT' | 'GOAL' | 'BUDGET' | 'SUBSCRIPTION' | 'PAYMENT_METHOD'
  entity_id   String   @db.Uuid
  order       Int      @default(0)
  created_at  DateTime @default(now()) @db.Timestamptz

  @@unique([user_id, entity_type, entity_id])
  @@map("pinned_items")
}
```

---

### C-15: Dimensión Temporal — Preguntas Históricas

El sistema debe poder responder:

| Pregunta | Implementación |
|---|---|
| ¿Cómo estaba mi liquidez hace 6 meses? | `BalanceProjection` (ya existe en schema) |
| ¿Cuál fue mi mejor mes? | Endpoint `/dashboard/monthly-flow?year=2026` |
| ¿Cómo evolucionó mi ahorro? | Historial de `goal.current_amount` con timestamps |
| ¿Qué categoría creció más? | Endpoint `/analytics/categories?period=6m` |
| ¿Cuánto llevo pagando Netflix? | `Subscription.created_at` + historial de pagos |
| ¿Qué meta avanzó más rápido? | Comparar `goal.current_amount` vs `created_at` |

**Requisito**: Los endpoints de analytics deben exponer comparativas por período (mes, trimestre, año). Los datos históricos se construyen sobre el historial de transacciones existente.

---

### C-16: Módulo de Métodos de Pago (D-16)

**Objetivo**: Separar la **cuenta donde está el dinero** del **instrumento utilizado para pagar**.

```
Cuenta: Banco Pichincha ($4,820)
  └─ Método de Pago: Visa Débito terminada en 4821

Cuenta: Banco Guayaquil ($2,100)
  └─ Método de Pago: Mastercard Crédito Platinum
```

#### Modelo `PaymentMethod`

```prisma
model PaymentMethod {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id          String    @db.Uuid
  account_id       String?   @db.Uuid   // Cuenta asociada (opcional para tarjetas de crédito independientes)
  type             String    // DEBIT_CARD | CREDIT_CARD | CASH | DIGITAL_WALLET | BANK_TRANSFER
  network          String?   // VISA | MASTERCARD | AMEX | DISCOVER
  alias            String    @db.VarChar(100) // "Visa Principal", "Mastercard Platinum"
  last_four_digits String?   @db.Char(4)
  expiration_month Int?
  expiration_year  Int?
  color            String?   @db.Char(7)
  icon             String?   @db.VarChar(50)
  is_default       Boolean   @default(false)
  is_active        Boolean   @default(true)
  created_at       DateTime  @default(now()) @db.Timestamptz
  updated_at       DateTime  @updatedAt @db.Timestamptz

  user         User          @relation(...)
  account      Account?      @relation(...)
  transactions Transaction[]
  subscriptions Subscription[]

  @@map("payment_methods")
}
```

#### Campo en `Transaction`

```prisma
// Agregar a model Transaction:
  payment_method_id String? @db.Uuid   // Con qué instrumento se pagó
  merchant_id       String? @db.Uuid   // Dónde se realizó el pago
```

#### Módulo `Merchant` (Catálogo de Comercios)

```prisma
model Merchant {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String?   @db.Uuid   // NULL = comercio global del sistema
  name        String    @db.VarChar(100)  // "Netflix", "Spotify", "Amazon"
  category    String?   @db.VarChar(50)  // Clasificación genérica
  logo_url    String?   @db.VarChar(500)
  website     String?   @db.VarChar(500)
  color       String?   @db.Char(7)
  is_system   Boolean   @default(false)  // Comercios predefinidos del sistema
  created_at  DateTime  @default(now()) @db.Timestamptz

  transactions  Transaction[]
  subscriptions Subscription[]

  @@map("merchants")
}
```

#### Casos de uso habilitados por este módulo

| Pregunta | Respuesta |
|---|---|
| ¿Con qué tarjeta pagué Netflix? | `Transaction WHERE merchant.name='Netflix'` → `payment_method` |
| ¿Qué tarjeta uso más? | `COUNT(*) GROUP BY payment_method_id` |
| ¿Dónde está registrada mi Visa? | `Transaction + Subscription WHERE payment_method_id = Visa` → `GROUP BY merchant` |
| ¿Cuánto gasté con Mastercard este mes? | `SUM(amount) WHERE payment_method = Mastercard AND date IN mes` |
| Si la tarjeta vence, ¿dónde hay que actualizar? | `merchants WHERE payment_method_id = tarjeta_vencida` |

#### Vista de Tarjeta

```
┌─ Visa Débito Banco Pichincha ──────────────────┐
│ **** **** **** 4821   Vence: 03/2027       │
│                                             │
│ Registrada en:                              │
│  ✓ Netflix                                  │
│  ✓ Spotify                                  │
│  ✓ ChatGPT                                  │
│  ✓ Google One                               │
│  ✓ Amazon                                   │
│                                             │
│ Gastos este mes: $143.00                    │
│ Transacciones: 12                           │
└───────────────────────────────────────────┘
```

---

## 16. Resumen de Cambios en el Schema de Base de Datos

### Nuevas tablas

| Tabla | Fase | Prioridad |
|---|---|---|
| `reserved_funds` | D | Alta |
| `blocked_funds` | D | Alta |
| `subscriptions` | D | Alta |
| `payment_methods` | D | Alta |
| `merchants` | D | Alta |
| `pinned_items` | D | Media |
| `recurring_transactions` | C | Media |
| `notifications` | A | Alta |

### Columnas a agregar en tablas existentes

| Tabla | Columna | Tipo | Default |
|---|---|---|---|
| `transactions` | `is_third_party` | Boolean | false |
| `transactions` | `third_party_owner` | VarChar(100) | NULL |
| `transactions` | `third_party_note` | VarChar(500) | NULL |
| `transactions` | `payment_method_id` | UUID | NULL |
| `transactions` | `merchant_id` | UUID | NULL |
| `goals` | `description` | VarChar(1000) | NULL |
| `goals` | `priority` | VarChar(20) | 'MEDIUM' |
| `goals` | `color` | Char(7) | NULL |
| `goals` | `icon` | VarChar(50) | NULL |
| `goals` | `account_id` | UUID | NULL |
| `goals` | `monthly_target` | Decimal(15,4) | NULL |
| `goals` | `auto_contribute` | Boolean | false |
| `goals` | `is_archived` | Boolean | false |
| `budgets` | `soft_limit` | Decimal(15,4) | NULL |
| `budgets` | `carry_over` | Boolean | false |
| `budgets` | `ignore_refunds` | Boolean | false |
| `budgets` | `ignore_transfers` | Boolean | true |
| `budgets` | `is_frozen` | Boolean | false |
| `budgets` | `notes` | Text | NULL |
| `reserved_funds` | `fund_type` | VarChar(20) | 'RESERVE' |

> [!NOTE]
> Todos los cambios son aditivos (no destructivos). Columnas nuevas con valores default. Tablas nuevas sin dependencias de las existentes. Riesgo de migración: **Bajo**.

---

## 17. Cambios Arquitectónicos v2.2 — Última Ronda (Cierre Definitivo)

> [!CAUTION]
> Estos son los **últimos cambios de dominio aceptados**. Una vez incorporados, la fase de diseño queda **CONGELADA**. No se agregan nuevas entidades ni cambios de alcance durante el desarrollo.

---

### C-17: Módulo de Deudas (Liabilities)

Una deuda no es un gasto. Es un **pasivo financiero** con estructura propia que impacta directamente el cálculo del patrimonio neto.

```prisma
model Liability {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id           String    @db.Uuid
  account_id        String?   @db.Uuid   // Cuenta desde la que se pagan las cuotas
  name              String    @db.VarChar(200)  // "Crédito vehículo", "Préstamo personal"
  type              String    // PERSONAL_LOAN | MORTGAGE | CREDIT_CARD_DEBT | INSTALLMENT | OTHER
  original_amount   Decimal   @db.Decimal(15, 4)  // Capital original
  current_balance   Decimal   @db.Decimal(15, 4)  // Saldo pendiente
  interest_rate     Decimal?  @db.Decimal(5, 4)   // Tasa de interés anual (ej. 0.1450 = 14.50%)
  total_installments Int?                          // Número total de cuotas
  paid_installments  Int      @default(0)          // Cuotas pagadas
  installment_amount Decimal? @db.Decimal(15, 4)   // Valor de cada cuota
  next_due_date     DateTime? @db.Date             // Próxima fecha de pago
  final_due_date    DateTime? @db.Date             // Fecha de vencimiento final
  currency          String    @db.Char(3)
  creditor_name     String?   @db.VarChar(200)    // Banco o acreedor
  notes             String?   @db.Text
  status            String    @default("ACTIVE")  // ACTIVE | PAID | CANCELLED
  created_at        DateTime  @default(now()) @db.Timestamptz
  updated_at        DateTime  @updatedAt @db.Timestamptz
  deleted_at        DateTime? @db.Timestamptz     // soft delete
  @@map("liabilities")
}
```

**Impacto en Patrimonio Neto**:
```
Patrimonio Neto =
  SUM(account.current_balance)
  + SUM(asset.current_value)     ← nuevo (C-18)
  − SUM(reserved_funds.amount)
  − SUM(blocked_funds.amount)
  − SUM(liability.current_balance)  ← nuevo (C-17)
  − Dinero de Terceros
```

---

### C-18: Módulo de Activos (Assets)

El patrimonio no depende únicamente del dinero en cuentas. Los bienes físicos, inversiones y activos digitales forman parte del patrimonio real.

```prisma
model Asset {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String    @db.Uuid
  name            String    @db.VarChar(200)   // "Laptop MacBook Pro", "Toyota Corolla 2020"
  type            String    // VEHICLE | ELECTRONICS | REAL_ESTATE | STOCK | CRYPTO | OTHER
  description     String?   @db.Text
  purchase_value  Decimal   @db.Decimal(15, 4) // Valor de compra
  current_value   Decimal   @db.Decimal(15, 4) // Valor actual (actualizado manualmente o por reglas)
  purchase_date   DateTime? @db.Date
  currency        String    @db.Char(3)
  color           String?   @db.Char(7)
  icon            String?   @db.VarChar(50)
  is_depreciating Boolean   @default(false)   // ¿El activo pierde valor con el tiempo?
  is_active       Boolean   @default(true)
  notes           String?   @db.Text
  created_at      DateTime  @default(now()) @db.Timestamptz
  updated_at      DateTime  @updatedAt @db.Timestamptz
  deleted_at      DateTime? @db.Timestamptz

  value_history   AssetValuation[]
  @@map("assets")
}

model AssetValuation {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  asset_id   String   @db.Uuid
  value      Decimal  @db.Decimal(15, 4)  // Valor registrado en esa fecha
  note       String?  @db.VarChar(500)    // "Depreciación anual", "Precio de mercado"
  recorded_at DateTime @db.Date
  created_at DateTime @default(now()) @db.Timestamptz
  @@map("asset_valuations")
}
```

**Tipos de activos soportados**:

| Tipo | Comportamiento |
|---|---|
| VEHICLE | Depreciación manual anual |
| ELECTRONICS | Depreciación manual |
| REAL_ESTATE | Revalorización manual |
| STOCK | Valor manual (futura integración con API) |
| CRYPTO | Valor manual (futura integración con API) |
| OTHER | Sin regla específica |

---

### C-19: Resumen Financiero Diario

El Dashboard debe comenzar con un **bloque de resumen contextual** que comunique información, no solo muestre números:

```
┌─ Buenos días, Ángel — Martes 1 de Agosto, 2026 ───────────────────┐
│                                                                       │
│  💵 Hoy puedes gastar hasta $4,820.50                                 │
│  ⏰ Hoy vence Netflix ($20.00) y el recibo de luz ($45.00)             │
│  📈 Tu patrimonio aumentó $430.00 desde ayer                          │
│  ⚠️  El presupuesto de Transporte está al 87% — ve despacio           │
│  🎯 Tu meta más cercana es "Laptop" — faltan $560 (89 días)           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

Generado por el endpoint `/api/v1/dashboard/daily-summary`. Máximo 5 líneas. Cada línea tiene icono + texto legible + acción opcional. No es un Insight — es el **saludo inteligente del sistema**.

---

### C-20: Objetivos Financieros (FinancialObjective)

Crear un nivel superior a las metas. Un **Objetivo Financiero** agrupa varias metas relacionadas:

```
Objetivo: Comprar casa
  ├─ Meta 1: Entrada    ($30,000 — Alta prioridad)
  ├─ Meta 2: Escrituras ($5,000  — Media prioridad)
  └─ Meta 3: Mudanza    ($2,000  — Baja prioridad)
```

```prisma
model FinancialObjective {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String   @db.Uuid
  name        String   @db.VarChar(200)  // "Comprar casa", "Retiro anticipado"
  description String?  @db.Text
  target_date DateTime? @db.Date
  color       String?  @db.Char(7)
  icon        String?  @db.VarChar(50)
  status      String   @default("ACTIVE")  // ACTIVE | COMPLETED | ARCHIVED
  created_at  DateTime @default(now()) @db.Timestamptz
  updated_at  DateTime @updatedAt @db.Timestamptz
  goals       Goal[]   // Un objetivo tiene múltiples metas
  @@map("financial_objectives")
}

// Agregar a model Goal:
//   objective_id String? @db.Uuid  // Relación con FinancialObjective (opcional)
```

**Progreso del objetivo** = promedio ponderado del progreso de todas sus metas.

---

### C-21: Simulador Financiero

Permite responder preguntas hipotéticas **sin modificar datos reales**. Solo cálculos en memoria:

| Pregunta | Input del usuario | Output |
|---|---|---|
| ¿Qué pasa si ahorro $100 más al mes? | `+$100/mes` | Fecha nueva de cada meta |
| ¿Qué pasa si elimino una suscripción? | `−Netflix $20` | Liquidez nueva + impacto en metas |
| ¿Qué pasa si recibo un aumento de sueldo? | `+$500/mes` | Proyección de patrimonio a 12 meses |
| ¿Qué pasa si compro este producto? | `−$800 hoy` | Impacto en disponible y metas |

**Regla crítica**: Las simulaciones **nunca persisten datos**. Son cálculos en el backend sobre los datos actuales del usuario con un delta hipotético.

**Endpoint**:
```
POST /api/v1/simulator/run

Body: {
  scenarios: [
    { type: 'ADD_INCOME', amount: 500, currency: 'USD', frequency: 'MONTHLY' },
    { type: 'REMOVE_SUBSCRIPTION', subscription_id: '...' }
  ],
  projection_months: 12
}

Response: {
  projected_net_worth: [...],    // Por mes durante 12 meses
  goal_completion_dates: [...],  // Nueva fecha estimada por meta
  monthly_available: [...],      // Disponible libre proyectado
  insights: [...]                // Qué cambia y por qué
}
```

---

### C-22: Calendario Financiero

Una vista de calendario mensual que integra todos los eventos financieros del usuario:

| Tipo de evento | Fuente de datos |
|---|---|
| Pagos programados | `recurring_transactions.next_due_date` |
| Vencimientos de reservas | `reserved_funds.due_date` |
| Cuotas de deudas | `liability.next_due_date` |
| Suscripciones | `subscriptions.next_billing_at` |
| Fechas objetivo de metas | `goal.target_date` |
| Transferencias programadas | `recurring_transactions WHERE type=TRANSFER` |

**Vistas disponibles**: Mensual (principal) + Semanal + Lista de próximos 30 días.

No requiere tabla nueva. Se construye agregando los campos `next_due_date` / `due_date` de todas las entidades existentes.

---

### C-23: Evolución de Activos

Cubierto por `AssetValuation` en C-18. El usuario puede registrar el valor actual de un activo en cualquier momento. El historial de valuaciones permite graficar la evolución del valor:

```
Laptop MacBook Pro 16"
  Comprada: $3,200 (Enero 2024)
  Valor actual: $1,800 (Agosto 2026)
  Depreció: 43.75% en 20 meses

  Historial:
    Ene 2024:  $3,200  (compra)
    Jul 2024:  $2,800  (valor mercado)
    Ene 2025:  $2,200
    Ago 2026:  $1,800
```

En el gráfico del activo se muestra la curva de valor a lo largo del tiempo usando `asset_valuations`.

---

### C-24: Relaciones de Dominio — Mapa Formal

```
FinancialObjective
    └── Goal[]
           └── aportes (via Transaction WHERE goal_id)

Account
    └── FinancialInstrument[]   ← instrumento vinculado a la cuenta
           └── Transaction[]
                  └── Merchant          (dónde se pagó)
                  └── Category          (clasificación)
                  └── Tag[]             (etiquetas transversales)
                  └── Attachment[]      (comprobantes)

Subscription
    └── Merchant              (a quién pertenece)
    └── FinancialInstrument   (con qué se paga)
    └── Category             (clasificación del gasto)

Liability
    └── Account              (cuenta desde la que se paga)

Asset
    └── AssetValuation[]     (historial de valor)
```

Este mapa es la **fuente de verdad** para los joins y relaciones de Prisma.

---

### C-25: Motor de Reglas — Estructura Base (Sin Implementación)

No se implementa ahora. Pero el dominio queda preparado para recibirlo en Fase G sin romper la arquitectura.

**Estructura conceptual**:
```ts
interface AutoRule {
  id: string;
  trigger: {
    event: 'INCOME_RECEIVED' | 'BUDGET_THRESHOLD' | 'GOAL_COMPLETED' | 'MONTH_END';
    conditions: RuleCondition[];
  };
  actions: {
    type: 'MOVE_TO_GOAL' | 'RESERVE_AMOUNT' | 'ALERT_USER' | 'FREEZE_BUDGET';
    params: Record<string, unknown>;
  }[];
  is_active: boolean;
}
```

**Ejemplos de reglas futuras**:
- "Cuando llegue un ingreso > $1,000 → mover 10% al Fondo de Emergencia"
- "Si un presupuesto supera el 80% → crear alerta HIGH"
- "Al finalizar el mes → generar resumen y aplicar carry_over"

La tabla `auto_rules` existe en el schema. La implementación va en Fase G.

---

### C-26: Motor Analítico

Una capa de analytics separada que permite responder preguntas históricas y comparativas **sin afectar el rendimiento del Dashboard principal**.

**Endpoints del Motor Analítico**:

```
GET /api/v1/analytics/summary?period=6m
    Resumen general: mejor mes, peor mes, promedio de ahorro

GET /api/v1/analytics/spending-by-category?period=3m
    Dónde gastó más, qué categoría creció más

GET /api/v1/analytics/by-instrument?period=1m
    Qué tarjeta o instrumento se usó más

GET /api/v1/analytics/by-merchant?period=1m
    Qué comercios se usaron más

GET /api/v1/analytics/goals?period=12m
    Qué meta avanzó más rápido / más lento

GET /api/v1/analytics/net-worth-evolution?period=12m
    Evolución del patrimonio neto mes a mes
```

**Preguntas que responde**:
- ¿Cuál fue mi mejor y peor mes?
- ¿Dónde gasto más?
- ¿Qué tarjeta uso más?
- ¿Qué comercio uso más?
- ¿Qué meta avanza más lento?
- ¿Qué categoría crece más?

---

### C-27: FinancialInstrument (Reemplaza PaymentMethod)

`PaymentMethod` es demasiado restrictivo. El dominio usa `FinancialInstrument` como concepto más amplio y extensible:

```ts
enum FinancialInstrumentType {
  BANK_ACCOUNT    // Cuenta bancaria directa
  DEBIT_CARD      // Tarjeta débito (vinculada a cuenta)
  CREDIT_CARD     // Tarjeta crédito (línea independiente)
  CASH            // Efectivo
  DIGITAL_WALLET  // PayPal, Nequi, Mercado Pago, etc.
  MOBILE_PAYMENT  // Apple Pay, Google Pay
  CRYPTO_WALLET   // Billetera de criptomonedas
  PREPAID_CARD    // Tarjeta prepago
  OTHER           // Extensible sin romper el modelo
}
```

```prisma
model FinancialInstrument {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id          String    @db.Uuid
  account_id       String?   @db.Uuid    // Cuenta bancaria vinculada (puede ser NULL para instrumentos independientes)
  type             String    // FinancialInstrumentType
  network          String?   // VISA | MASTERCARD | AMEX | DISCOVER | RUPAY
  alias            String    @db.VarChar(100)  // "Visa Principal", "Nequi Personal"
  last_four_digits String?   @db.Char(4)
  expiration_month Int?
  expiration_year  Int?
  color            String?   @db.Char(7)
  icon             String?   @db.VarChar(50)
  status           String    @default("ACTIVE")  // ACTIVE | EXPIRED | BLOCKED | CANCELLED
  is_default       Boolean   @default(false)
  created_at       DateTime  @default(now()) @db.Timestamptz
  updated_at       DateTime  @updatedAt @db.Timestamptz
  deleted_at       DateTime? @db.Timestamptz

  user          User            @relation(...)
  account       Account?        @relation(...)
  transactions  Transaction[]
  subscriptions Subscription[]

  @@map("financial_instruments")
}
```

> [!IMPORTANT]
> `PaymentMethod` (C-16) queda **reemplazado** por `FinancialInstrument` (C-27). El modelo es compatible — mismos campos, concepto ampliado. La tabla en la DB se llamará `financial_instruments`.

---

### C-28: Gestión Completa de Instrumentos Financieros

Cada instrumento financiero expone una vista de detalle completa:

```
┌─ Visa Débito — Banco Pichincha ───────────────────────┐
│ **** **** **** 4821  │  Vence: 03/2027  │  ACTIVA  │
├────────────────────────────────────────────────────────┤
│  Cuenta vinculada: Banco Pichincha ($4,820.50)          │
│  Gasto este mes:   $143.00  (12 transacciones)          │
│  Último uso:        Ayer — Netflix $20.00               │
├────────────────────────────────────────────────────────┤
│  Registrada en:                                         │
│   ✓ Netflix            │  ✓ Spotify                    │
│   ✓ ChatGPT            │  ✓ Google One                 │
│   ✓ Amazon             │  ✓ GitHub Copilot             │
├────────────────────────────────────────────────────────┤
│  Suscripciones activas: 6  │  Total mensual: $83.00     │
└────────────────────────────────────────────────────────┘
```

**Casos de uso respondidos**:
- ¿Dónde tengo registrada esta tarjeta?
- ¿Qué servicios debo actualizar si vence o la reemplazo?
- ¿Con qué tarjeta gasto más este mes?
- ¿Qué instrumento utilizo para Netflix?
- ¿Qué comercios dependen de este instrumento?

---

## 18. Schema Final — Todas las Tablas Nuevas

### Tablas nuevas (orden de creación recomendado)

| # | Tabla | Fase | Descripción |
|---|---|---|---|
| 1 | `notifications` | A | Centro de notificaciones |
| 2 | `financial_instruments` | A | Reemplaza `payment_methods` (C-27) |
| 3 | `merchants` | A | Catálogo de comercios |
| 4 | `recurring_transactions` | C | Transacciones recurrentes con sugerencias |
| 5 | `reserved_funds` | D | Dinero comprometido para pagos futuros |
| 6 | `blocked_funds` | D | Dinero intocable |
| 7 | `subscriptions` | D | Suscripciones separadas de reservas |
| 8 | `pinned_items` | D | Favoritos genéricos con orden |
| 9 | `liabilities` | D | Deudas y préstamos (C-17) |
| 10 | `assets` | D | Bienes y activos (C-18) |
| 11 | `asset_valuations` | D | Historial de valor de activos (C-23) |
| 12 | `financial_objectives` | E | Objetivos que agrupan metas (C-20) |
| 13 | `auto_rules` | G | Motor de reglas (estructura base, sin implementación) |

### Columnas nuevas en tablas existentes

| Tabla | Columna | Tipo | Default | Fase |
|---|---|---|---|---|
| `transactions` | `is_third_party` | Boolean | false | A |
| `transactions` | `third_party_owner` | VarChar(100) | NULL | A |
| `transactions` | `third_party_note` | VarChar(500) | NULL | A |
| `transactions` | `financial_instrument_id` | UUID | NULL | A |
| `transactions` | `merchant_id` | UUID | NULL | A |
| `goals` | `objective_id` | UUID | NULL | E |
| `goals` | `description` | VarChar(1000) | NULL | E |
| `goals` | `priority` | VarChar(20) | 'MEDIUM' | E |
| `goals` | `color` | Char(7) | NULL | E |
| `goals` | `icon` | VarChar(50) | NULL | E |
| `goals` | `account_id` | UUID | NULL | E |
| `goals` | `monthly_target` | Decimal(15,4) | NULL | E |
| `goals` | `auto_contribute` | Boolean | false | E |
| `goals` | `is_archived` | Boolean | false | E |
| `budgets` | `soft_limit` | Decimal(15,4) | NULL | F |
| `budgets` | `carry_over` | Boolean | false | F |
| `budgets` | `ignore_refunds` | Boolean | false | F |
| `budgets` | `ignore_transfers` | Boolean | true | F |
| `budgets` | `is_frozen` | Boolean | false | F |
| `budgets` | `notes` | Text | NULL | F |
| `reserved_funds` | `fund_type` | VarChar(20) | 'RESERVE' | D |

> [!NOTE]
> Todos los cambios son **aditivos y no destructivos**. Ninguna columna existente se modifica. Riesgo de migración: Bajo.

---

## 🔒 Declaración de Cierre Oficial de la Fase de Análisis

> [!CAUTION]
> ## DISEÑO CONGELADO — FASE DE ANÁLISIS CERRADA
>
> A partir de este momento, **queda cerrada definitivamente la fase de análisis, diseño y planificación del producto**.

### Lo que está cerrado

| Área | Estado |
|---|---|
| ✅ Modelo de dominio | **CONGELADO** — entidades, relaciones y reglas definidas |
| ✅ Arquitectura funcional | **CONGELADO** — DDD + Clean Arch + FSD + Atomic Design |
| ✅ Design System | **CONGELADO** — tokens, componentes y reglas definidas |
| ✅ Roadmap (Fases A–G) | **CONGELADO** — orden y contenido definidos |
| ✅ MVP v1.0 | **CONGELADO** — alcance claramente delimitado |
| ✅ Definition of Done | **CONGELADO** — 18 criterios por feature |
| ✅ Decisiones D-01 a D-20 | **CONGELADAS** — confirmadas por el usuario |
| ✅ Schema de base de datos | **CONGELADO** — 13 tablas nuevas + 21 columnas adicionales |

### Reglas durante el desarrollo

1. **Permitido**: Correcciones de bugs e inconsistencias detectadas durante la implementación.
2. **Permitido**: Mejoras de calidad técnica que no cambien el alcance funcional.
3. **Permitido**: Ajustes menores de UX basados en validación visual real.
4. **No permitido**: Agregar nuevas entidades de dominio sin aprobación explícita.
5. **No permitido**: Cambiar el alcance del MVP sin aprobación explícita.
6. **No permitido**: Reorganizar el roadmap de fases.
7. **No permitido**: Reemplazar decisiones D-01 a D-20 sin documentación del cambio.

### Objetivo a partir de este momento

> Desarrollar el sistema **de principio a fin**, respetando la arquitectura, el dominio, el Design System, las reglas de negocio, los contratos de API y el Definition of Done definidos en este documento.

**El proyecto entra oficialmente en la Fase A de desarrollo.**

---

*MyMoney Product Charter v3.0 — Agosto 2026*
*Decisiones D-01 a D-20 — CONGELADAS*
*Cambios C-01 a C-28 — INCORPORADOS*
*🔒 DOCUMENTO CONGELADO — No se aceptan nuevas funcionalidades ni cambios de dominio*
