# ADR-014: Budget Expiration Policy (Lazy Evaluation)

## Contexto
El modelo de dominio original de presupuestos contemplaba un mecanismo dual para la expiración de presupuestos (cambiar su estado de `ACTIVE` a `EXPIRED` una vez superada su `end_date`):
1. **Mecanismo Primario**: Un Cron Job programado que corriera a las 3:00 AM UTC diariamente, barrenando todos los presupuestos activos.
2. **Mecanismo Secundario**: Evaluación idempotente (*Lazy Expiration*) en el ciclo de vida de la entidad, comprobada al vuelo en cada lectura.

Dado que actualmente la infraestructura (NestJS) no posee el módulo `@nestjs/schedule` y un cron job requeriría iterar masivamente sobre la base de datos sin un requerimiento crítico en la fase actual del producto, se revaluó el alcance arquitectónico.

## Decisión
Se descartó el mecanismo CRON originalmente considerado. El sistema utiliza exclusivamente **Lazy Expiration** durante las operaciones de lectura y cálculo. La transición mantiene comportamiento idempotente sin afectar los invariantes del agregado de presupuestos. 

## Consecuencias
- **Reducción de complejidad operativa**: Evitamos depender de la programación de tareas asíncronas y su subsecuente monitoreo de fallos.
- **Eficiencia**: La comprobación de expiración se transfiere a la demanda (just-in-time) y es transparente para la capa de presentación.
- **Deuda Documental Resuelta**: La documentación del modelo de dominio (`03-domain-model.md`) fue modificada para reflejar que este es un cambio arquitectónico consciente y no una omisión de la implementación.
