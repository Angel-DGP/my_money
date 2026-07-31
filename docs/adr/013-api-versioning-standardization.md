# ADR-013: Estandarización de Versionado de Endpoints (Deuda Técnica)

## Contexto
Durante el desarrollo del backend de **MyMoney** y las pruebas E2E de los distintos módulos (`Accounts`, `Categories`, `Transactions`, `Budgets`), se identificó una inconsistencia en la definición de las rutas de los endpoints.

Algunos endpoints exponen directamente el recurso, mientras que otros están anidados bajo un prefijo de versión. Por ejemplo:
- `/accounts`
- `/transactions`
- `/budgets`
- `/api/v1/categories`

## Decisión
Se registra esta situación formalmente como una **deuda técnica transversal**.

No se bloqueará la culminación del módulo actual (`Budgets`) para corregir esta inconsistencia, dado que es un patrón heredado del proyecto y no una regresión introducida recientemente.

La acción a futuro requerida es:
> **Estandarizar el versionado de endpoints para todos los módulos (e.g., estableciendo globalmente el prefijo `/api/v1/`) en una futura iteración.**

## Consecuencias
- La API actual continuará funcionando con endpoints de formato mixto durante las iteraciones del MVP.
- Cualquier integración o frontend deberá basarse estrictamente en los paths documentados en `05-api-contracts.md`.
- Al momento de saldar esta deuda técnica, se requerirá un refactor coordinado (por ejemplo, configurando `app.setGlobalPrefix('api/v1')` en NestJS) y la subsecuente actualización de todos los tests E2E y clientes que dependan de las rutas actuales.
