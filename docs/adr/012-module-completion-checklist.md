# ADR-012: Module Completion Checklist

## Contexto
A medida que el proyecto crece, es vital asegurar que cada módulo siga las mismas convenciones y estándares arquitectónicos antes de darse por completado y pasar al siguiente dominio. Para evitar inconsistencias (como diferencias en repositorios, eventos de dominio, nombramiento de DTOs o casos de uso), se requiere una lista de verificación estricta.

## Decisión
Se establece la siguiente **Module Completion Checklist**. Ningún módulo podrá darse por cerrado ni se podrá iniciar el trabajo en el siguiente dominio sin haber validado positivamente todos estos puntos:

### 1. Arquitectura (Architecture)
- [ ] No existen dependencias circulares entre módulos.
- [ ] Los módulos no dependen de detalles de implementación de otros módulos, **solo a través de interfaces** expuestas explícitamente (ej. `I...Repository`).
- [ ] Los repositorios inyectan dependencias utilizando siempre tokens `Symbol` constantes (ej. `ACCOUNT_REPOSITORY`).
- [ ] Las excepciones de negocio extienden siempre de `BusinessRuleViolationException` y están agrupadas por dominio (ej. `AccountException`, `CategoryException`).
- [ ] Los eventos de dominio extienden de la misma base compartida y exponen consistentemente `aggregateId`, `occurredAt`, `correlationId`, y `requestId`.

### 2. Calidad (Quality)
- [ ] `pnpm build` compila correctamente sin errores ni warnings.
- [ ] Existe un script E2E (`verify-*.js`) ejecutado y verificado positivamente con la API en vivo.
- [ ] Los casos de uso (Use Cases) siguen la convención estándar: `CreateXUseCase`, `GetXUseCase` (individual), `ListXUseCase` (múltiple), `UpdateXUseCase`, `DeleteXUseCase` (para soft delete o hard delete).

### 3. Persistencia (Persistence)
- [ ] Los repositorios implementan e inyectan `IRepository` de forma consistente.
- [ ] Las operaciones en cascada (e.g. `saveMany`, borrado en cascada) se realizan atómicamente utilizando transacciones de base de datos (e.g. `prisma.$transaction`).
- [ ] El seed del módulo (si aplica) es **idempotente** (e.g. utilizando verificaciones previas como `findFirst`). Ejecutarlo 5 veces seguidas produce el mismo resultado que ejecutarlo 1 vez.

### 4. API (API & Contracts)
- [ ] Los controladores usan `@Request()` explícitamente para extraer el contexto (e.g. `userId` inyectado por el `SessionGuard`).
- [ ] Los DTOs siguen estrictamente la convención de nomenclatura: `[Action][Entity]Dto` (e.g. `CreateAccountDto`) para requests, y `[Entity]Dto` (e.g. `AccountDto`) para responses.
- [ ] Swagger está documentado y actualizado. Si hubo discrepancias con los contratos OpenAPI congelados (ej. `05-api-contracts.md`), se resolvió respetando la documentación o se levantó un nuevo ADR.

### 5. Observabilidad
- [ ] Todos los errores de dominio son capturados por el `DomainExceptionFilter` de forma global, retornando correctamente la estructura `ERROR_...`.

### 6. Documentación (Documentation)
- [ ] El artefacto `walkthrough.md` ha sido actualizado o creado resumiendo los cambios y demostrando el flujo.
- [ ] Cualquier decisión de diseño importante que se desvió del plan original cuenta con un ADR (Architecture Decision Record) asociado.

## Consecuencias
Esta checklist será el criterio de aceptación para los futuros módulos (como `Transactions`, `Budgets` y `Goals`). Obligará a que todos los desarrollos mantengan un estándar técnico impecable desde la primera iteración.
