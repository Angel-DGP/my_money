# Estado del Backend

Este documento refleja el estado oficial de la arquitectura, métricas de calidad y convenciones del backend tras la fase de estabilización. Este estado es la base para iniciar la integración con el frontend.

## Estado General
**ESTADO:** ESTABLE Y VERIFICADO (Release Candidate)

El backend de My Money cumple rigurosamente con los patrones de Clean Architecture y Domain-Driven Design (DDD) documentados.

---

## Convenciones y Estandarización Transversal

Se han aplicado de forma uniforme en todos los módulos (`Accounts`, `Transactions`, `Categories`, `Budgets`, `Goals`) las siguientes convenciones:

### 1. DTOs (Data Transfer Objects)
- **Ubicación:** Todos los DTOs residen en `presentation/dtos/` de sus respectivos módulos, ya que pertenecen a la capa de presentación y sirven como contrato para los clientes.
- **Nomenclatura:** Se utiliza el patrón `[Action][Entity]Dto` (ej. `CreateCategoryDto`, `UpdateAccountDto`) o simplemente `[Entity]Dto` para las respuestas.
- **División:** Se han consolidado en un solo archivo (ej. `category.dto.ts`) cuando no había previsión de un crecimiento inminente que justificase separarlos, evitando la división artificial. En módulos complejos (como Accounts y Transactions) se mantienen divididos.

### 2. Exceptions de Dominio
- **Ubicación:** Centralizadas en `domain/exceptions/`.
- **Nomenclatura:** Archivos nombrados como `[module].exceptions.ts` (ej. `goal.exceptions.ts`, `budget.exceptions.ts`).
- **Herencia:** Todas heredan adecuadamente para respetar las jerarquías de error de negocio (por lo general de una excepción base).

### 3. Controllers
- **Ubicación:** `presentation/`.
- **Estandarización:**
  - Importaciones organizadas consistentemente.
  - Uso estandarizado del decorador `@UseGuards(JwtAuthGuard)` y el decorador de usuario para extraer `req.user.id`.
  - Mismo estilo de respuestas, basándose en los DTOs correspondientes o devolviendo `204 No Content` para métodos de eliminación.
  - Estrategia de validación uniforme utilizando `ValidationPipe` (habilitado globalmente).

### 4. Repositories e Infraestructura
- **Patrón:** Implementación rigurosa de `Interface -> Prisma -> Mapper -> Entity`.
- **Nombres Descriptivos:** En los repositorios de Prisma, las variables mapeadas desde la base de datos utilizan nombres descriptivos (ej. `raw`, `count`, `accountRecord`) sin forzar artificialmente el nombre de variable exacto en todos lados, pero manteniendo el flujo semántico de `Persistencia -> Mapper -> Agregado`.
- **Dependencias:** Los controladores inyectan directamente los Casos de Uso, y estos últimos inyectan el Repositorio a través de la interfaz correspondiente, implementando Inversión de Control (IoC).

### 5. Event Handlers y Ciclo de Vida
Todos los Event Handlers y Casos de Uso que alteran el estado respetan el siguiente ciclo de vida inamovible:
1. `UseCase` recibe el payload.
2. Construye o recupera el **Aggregate Root**.
3. El Agregado emite eventos locales en memoria mediante `apply()`.
4. El `UseCase` guarda el estado mediante `repository.save()` / `commit()`.
5. El `UseCase` propaga los eventos del dominio: `eventEmitter.emit(...)`.
6. El `UseCase` limpia los eventos locales: `clearDomainEvents()`.

---

## Métricas de Calidad

```markdown
Build
✅ PASS

Lint
✅ 0 errors
✅ 0 warnings (Reglas controladas con suppressions justificados mediante eslint-disable)

Unit Tests
✅ 41 passing

E2E
✅ 12 passing

Coverage
✅ Report generated (100% éxito en test suites)
```

---

## Decisiones Arquitectónicas (ADRs)

| ADR | Estado | Descripción |
|---|---|---|
| **ADR-012** | Adoptado | Checklist y criterios de finalización de módulos. Utilizado para validar exitosamente los módulos Budgets y Goals. |
| **ADR-013** | Pendiente de implementación | Estandarización de versionado de API y prefijos globales de rutas (`/api/v1/`). Se aplicará posteriormente, por ahora se mantienen as-is (ej. `/budgets`). |
| **ADR-014** | Adoptado | Política de expiración de Budgets. Se eliminó la tarea automatizada en favor de una verificación lazy (`GetBudgetById` o transacciones). |

---

## Siguientes Pasos
Con esta línea base, el backend se considera congelado funcionalmente (Fase de Estabilización Completada).
Cualquier desarrollo futuro o ajuste para la integración del Frontend deberá respetar estrictamente este documento y las convenciones aquí establecidas.
