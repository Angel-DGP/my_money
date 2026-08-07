# UI Rules

- **Formularios de Creación**: Para la creación de entidades (cuentas, transacciones, presupuestos, metas, etc.), NO se deben utilizar modales (`Dialog` o ventanas flotantes). Todos los formularios de creación deben implementarse como **páginas dedicadas** (ej: `/transactions/new`, `/accounts/new`) utilizando el Feature Sliced Design (FSD) y siguiendo el flujo de navegación natural.

# Project Architecture & Quality Standards (Definition of Done)

## 1. Cohesion over Arbitrary File Limits
- Dividir los archivos **únicamente cuando existen responsabilidades distintas** o la cohesión disminuye, no por un límite arbitrario de líneas (ej. no forzar archivos de <150 líneas si eso fragmenta un componente innecesariamente en `styles`, `utils`, `helpers`, etc.).

## 2. Meaningful Reuse (Generic vs Specific)
- Los componentes deben ser verdaderamente genéricos y agnósticos al feature.
- **EVITAR** prop drilling masivo para casos de uso (ej. `<DataTable isBudget showGoals />`).
- **PREFERIR** composición (ej. `<DataTable columns={BudgetColumns} />`). Las columnas y datos pertenecen al feature, la tabla a UI.

## 3. Strict Separation of Concerns (No Financial Logic in UI)
- React **NUNCA** debe realizar cálculos financieros o de negocio (ej. `balance`, `netWorth`, `availableMoney`, `budgetVelocity`).
- Toda la lógica financiera pertenece estrictamente al backend (Dominio/Value Objects). React se limita a **renderizar** la información provista por el API.

## 4. Single Source of Truth for Business Rules
- **PROHIBIDO** duplicar reglas de negocio.
- Las validaciones (ej. `amount < 0`) deben vivir **UNA sola vez** en la capa de dominio (Value Objects como `Money`). No se deben repetir los `if/else` de dominio a lo largo de React o los servicios.

## 5. No Magic Numbers
- **PROHIBIDO** el uso de números mágicos (ej. `300`, `0.8`, `100`, `365`).
- Todo número debe extraerse a constantes semánticas de dominio, variables de configuración, o design tokens.

## 6. Universal Empty States
- Toda entidad, pantalla o sección debe contar con un **Empty State** dedicado.
- Ejemplos obligatorios: "No hay presupuestos", "No hay cuentas", "No hay metas", "No hay transacciones". Diferencian un producto profesional de un MVP.

## 7. Universal Error States
- Toda petición o sección debe contar con un **Error State** interactivo (con opciones de "Reintentar" o "Actualizar").
- Un "Spinner infinito" o pantalla en blanco tras un error es inaceptable.

## 8. Skeletons Obligatorios
- **NUNCA** utilizar textos genéricos como "Loading...".
- Todas las transiciones de carga deben usar componentes de **Skeleton** para mantener la estructura visual.

## 9. Responsive Design Integral
- El diseño debe ser responsive considerando múltiples resoluciones de escritorio, ya que la mayoría de los usuarios administrarán su dinero desde PC.
- Breakpoints esperados (mínimo): `1280px`, `1536px`, `1920px`, `2560px`, además de mobile y tablet.

## 10. Accesibilidad (a11y) Obligatoria
- Todos los elementos interactivos deben cumplir con los estándares de accesibilidad:
  - `aria-label`
  - `tabindex`
  - `focus-visible`
  - Navegación por teclado 100% funcional.
  - Soporte para screen readers.

## 11. Performance y Optimización
- **Métrica objetivo:** Lighthouse > 95.
- Prevenir renders innecesarios. Usar `React.memo` estratégicamente cuando sea necesario.
- Uso obligatorio de la caché de React Query.
- Implementar Lazy Loading y Code Splitting en rutas/componentes pesados.

## 12. Testing Riguroso
- La suite de pruebas no debe ser ambigua y abarcar:
  - Unit Tests
  - Integration Tests
  - Component Tests
  - E2E Tests

## 13. Storybook Exhaustivo
- **TODOS** los componentes dentro de `packages/ui` deben tener su archivo `stories.tsx` correspondiente. Sin excepciones.

## 14. Documentación de Componentes
- Todo componente importante debe incluir documentación clara sobre:
  - Qué hace.
  - Cuándo usarlo (y cuándo NO usarlo).
  - Ejemplos de uso práctico.
  - Descripción de sus Props.
  - Lista de Variantes disponibles.

## 15. Composición sobre Herencia/Duplicación
- **NO crear componentes monolíticos específicos** si pueden lograrse mediante composición.
- **EVITAR:** `BudgetCard`, `GoalCard`, `AccountCard`.
- **PREFERIR:** Ensamble usando bases del Design System: `<Card>`, `<Progress>`, `<Badge>`, `<Stat>`, `<Money>`, `<Avatar>`, `<Icon>`, `<Button>`.

## 16. Definition of Done (DoD) - Criterios de Aceptación
Una feature NO está terminada cuando compila. Solo está terminada cuando cumple el 100% de los siguientes criterios:
- [ ] Backend implementado
- [ ] Frontend implementado
- [ ] API fuertemente tipada
- [ ] Integración con React Query
- [ ] DTOs alineados y validados
- [ ] Validaciones de dominio ejecutadas
- [ ] Responsive Design completo (Mobile a 2560px)
- [ ] Dark Mode soportado
- [ ] Light Mode soportado
- [ ] Empty State implementado
- [ ] Error State con recuperación implementado
- [ ] Skeleton loading implementado
- [ ] Accesibilidad (a11y) validada
- [ ] Tests pasados
- [ ] Componentes registrados en Storybook
- [ ] Código documentado
- [ ] CERO usos de `any`
- [ ] CERO usos de `@ts-ignore` o ignorados silenciados
- [ ] CERO warnings de ESLint/TypeScript
- [ ] Build exitoso (`pnpm build` ok en web y api)
- [ ] Validación visual satisfactoria
