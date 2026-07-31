# MyMoney — Business Rules

> **Documento**: 02 de 07
> **Versión**: 1.1.0 — Julio 2026
> **Estado**: APROBADO — congelado para desarrollo del Domain Model
> **Dependencias**: `01-architecture.md` (congelado en v2.1)
> **Siguiente documento**: `03-domain-model.md`

---

> [!IMPORTANT]
> Este documento define **qué puede y qué no puede ocurrir en el sistema financiero**, independientemente de cómo esté implementado técnicamente.
>
> Las **Business Rules** son invariantes del **dominio financiero**. Las **Application Rules** (sección 9) son decisiones técnicas de implementación. Son mundos distintos y se mantienen separados deliberadamente.

---

## Índice

1. [Invariantes Globales](#1-invariantes-globales)
2. [Transacciones](#2-transacciones)
3. [Transferencias](#3-transferencias)
4. [Cuentas](#4-cuentas)
5. [Categorías](#5-categorías)
6. [Presupuestos](#6-presupuestos)
7. [Metas de Ahorro](#7-metas-de-ahorro)
8. [Máquinas de Estado](#8-máquinas-de-estado)
9. [Application Rules](#9-application-rules)
10. [Reglas Deliberadamente NO Implementadas](#10-reglas-deliberadamente-no-implementadas)
11. [Matriz de Decisiones para Casos Extremos](#11-matriz-de-decisiones-para-casos-extremos)
12. [Glosario del Dominio](#12-glosario-del-dominio)

---

## 1. Invariantes Globales

Estas son las reglas que gobiernan **todo el sistema**. Ninguna decisión técnica, optimización de rendimiento, ni conveniencia de implementación puede violarlas.

| ID | Invariante | Significado |
|---|---|---|
| **G-01** | **El dinero nunca desaparece** | Toda operación que mueve dinero es trazable. Si $100 salen de una cuenta, aparecen en otra o en el historial de egresos |
| **G-02** | **Todo movimiento pertenece exactamente a una cuenta** | No existe transacción sin cuenta. No existe dinero flotando entre cuentas |
| **G-03** | **Toda transferencia conserva el dinero** | La suma de todos los balances no cambia con una transferencia. Lo que sale de A entra exactamente en B |
| **G-04** | **Toda operación debe ser trazable** | El sistema siempre puede responder: quién hizo qué, cuándo, sobre qué dato |
| **G-05** | **Todo balance debe poder reconstruirse** | Dado el `initial_balance` y el historial completo de transacciones, el `current_balance` es reproducible |
| **G-06** | **Una operación nunca modifica el historial silenciosamente** | Editar o eliminar siempre deja traza. No existen cambios retroactivos invisibles |
| **G-07** | **El balance nunca se edita directamente** | `current_balance` solo cambia como consecuencia de un movimiento financiero. Nunca por edición directa del campo |

### Por qué estas invariantes van primero

Cuando aparezca una decisión técnica "conveniente", la primera pregunta es: **¿viola alguna invariante global?** Si sí, la decisión no procede sin importar su conveniencia.

---

## 2. Transacciones

Una **Transacción** es el registro de un movimiento de dinero en una cuenta. Es la entidad central — todo lo demás reacciona a ella.

### 2.1 Creación

#### TRX-R01 — El monto siempre es positivo

**Regla**: `amount > 0`. El tipo (INCOME/EXPENSE) determina si el balance sube o baja.

**Caso límite**: El usuario ingresa `-50` o `0`.

**Consecuencia de violación**: Cálculo de balance ambiguo. Un EXPENSE de `-50` podría interpretarse como INCOME.

**Implementación**: `Money` lanza `DomainException(TRX_003)` si `value <= 0`.

---

#### TRX-R02 — La fecha es la fecha del movimiento, no del registro

**Regla**: `date` representa cuándo ocurrió el movimiento. Un usuario puede registrar hoy una transacción de hace 3 meses.

**Caso límite**: Transacción de diciembre 2025 registrada en enero 2026 → aparece en reportes de diciembre 2025.

**Implementación**: Reportes y presupuestos siempre filtran por `transactions.date`, nunca por `created_at`.

---

#### TRX-R03 — Fecha futura con límite de tolerancia

**Regla**: Fechas futuras permitidas hasta **7 días** desde hoy. Más de 7 días es rechazado.

**Justificación**: Gastos programados cercanos son válidos. Más de 7 días suele ser error de digitación.

**Error**: `TRX_004`.

---

#### TRX-R04 — La categoría debe ser compatible con el tipo

**Regla**: Categoría `INCOME` no puede usarse en transacción `EXPENSE`. Categorías `BOTH` son siempre compatibles.

**Error**: `TRX_005`.

---

### 2.2 Edición

#### TRX-R05 — El tipo de transacción es inmutable

**Regla**: `type` (INCOME/EXPENSE/TRANSFER) no puede modificarse después de creación.

**Alternativa**: Eliminar y crear nueva transacción.

---

#### TRX-R06 — Editar el monto desencadena recalculo de balance

**Regla**: Cambio de monto → actualización atómica del balance en la misma transacción de DB.

**Domain Event**: `TransactionAmountChanged { transactionId, accountId, previousAmount, newAmount }`.

---

#### TRX-R07 — Cambiar la fecha entre períodos recalcula presupuestos

**Regla**: Si la fecha cruza un límite de período, los presupuestos de ambos períodos se recalculan.

**Caso límite**: Presupuesto del período destino no existe → el gasto no se acumula. No se crea automáticamente.

**Domain Event**: `TransactionDateChanged { previousDate, newDate, amount, categoryId }`.

---

#### TRX-R08 — Cambiar la categoría reasigna presupuestos

**Domain Event**: `TransactionCategoryChanged { previousCategoryId, newCategoryId, amount, date }`.

---

### 2.3 Eliminación

#### TRX-R09 — Las transacciones nunca se eliminan físicamente

**Regla**: Toda eliminación es soft delete (`deleted_at = NOW()`). El historial financiero es permanente.

---

#### TRX-R10 — Eliminar revierte el efecto en el balance

**Regla**: Soft delete → ajuste atómico del balance como si la transacción nunca existiera.

**Domain Event**: `TransactionDeleted { accountId, amount, type }`.

---

#### TRX-R11 — Eliminar no afecta a la categoría ni a la cuenta

**Regla**: Solo ajusta el balance (TRX-R10) y los presupuestos. Sin efecto cascada en otras entidades.

---

## 3. Transferencias

Una **Transferencia** mueve dinero entre dos cuentas del mismo usuario.

#### TRF-R01 — Una transferencia crea exactamente dos movimientos

**Regla**:
1. EXPENSE en la cuenta origen
2. INCOME en la cuenta destino

Ambos vinculados por `transfer_pair_id`.

---

#### TRF-R02 — La atomicidad de una transferencia es no negociable

**Regla**: O ambos movimientos se crean y ambos balances se actualizan, o ninguno. No existe estado intermedio.

**Consecuencia de violación**: Viola G-01 y G-03. El dinero desaparece o se duplica.

**Implementación**: Una sola transacción de DB con rollback total. Esto no es negociable aunque un Domain Event posterior falle.

---

#### TRF-R03 — Origen y destino no pueden ser la misma cuenta

**Regla**: `source_account_id ≠ destination_account_id`. Error `TRX_002`.

---

#### TRF-R04 — Transferencias entre monedas distintas

**Regla**: Permitidas. El usuario declara explícitamente el monto en cada moneda. El sistema no convierte automáticamente.

**Si monedas distintas y montos iguales**: Warning, no error.

---

#### TRF-R05 — Eliminar una transferencia elimina ambos movimientos

**Regla**: Soft delete de ambos en operación atómica.

**Los movimientos individuales son inmutables**: No se editan por separado. Solo eliminar y recrear.

---

## 4. Cuentas

#### ACC-R01 — El balance inicial es el estado histórico previo

**Regla**: `initial_balance` es el saldo antes de usar el sistema. No genera registro en `transactions`.

---

#### ACC-R02 — El balance inicial es inmutable después de la primera transacción

**Regla**: Con al menos una transacción, `initial_balance` no puede modificarse. Error `ACC_004`.

---

#### ACC-R03 — El balance NUNCA se modifica directamente

**Regla**: `current_balance` no está en ningún DTO de edición. Solo actualizado por handlers de Domain Events. Nunca por edición directa del campo.

**Invariante que soporta**: G-07, G-04, G-05.

---

#### ACC-R04 — Eliminar una cuenta con balance distinto de cero

**Regla**: Permitido sin restricción. El usuario es dueño de sus decisiones.

**UI**: Advertencia obligatoria mostrando el balance que dejará de verse. Las transacciones históricas se preservan.

---

#### ACC-R05 — Multi-moneda: cuentas en distintas monedas coexisten

**Regla**: El dashboard muestra cada cuenta en su moneda original. Sin consolidación automática en MVP.

---

## 5. Categorías

#### CAT-R01 — Jerarquía máxima de dos niveles

**Regla**: Padre → subcategoría. No existe sub-subcategoría.

---

#### CAT-R02 — Una subcategoría hereda el tipo de su padre

**Regla**: El tipo es siempre el del padre. Error `CAT_004` si se envía tipo incompatible.

---

#### CAT-R03 — Las categorías del sistema son inmutables

**Regla**: `is_system = true` → no modificables ni eliminables. Error `CAT_002`.

---

#### CAT-R04 — No se puede eliminar una categoría con transacciones

**Regla**: Categoría con transacciones (activas o soft-deleted) no es eliminable. Error `CAT_003` con conteo.

---

#### CAT-R05 — Eliminar la categoría padre elimina subcategorías en cascada

**Regla**: Solo si todas las subcategorías están vacías (sin transacciones). Operación atómica.

---

#### CAT-R06 — Eliminar una categoría desactiva sus presupuestos

**Domain Event**: `CategoryDeleted` → presupuestos asociados pasan a `INACTIVE`.

---

## 6. Presupuestos

#### BGT-R01 — Unicidad de presupuesto activo por categoría y período

**Regla**: Combinación única: `(user_id, category_id, period, start_date)`. Error `BGT_003`.

---

#### BGT-R02 — El período define el rango de acumulación

**Regla**: Solo transacciones con `date` dentro del período. Nunca por `created_at`.

---

#### BGT-R03 al BGT-R06 — Recalculo ante cambios en transacciones

| Evento | Regla | Domain Event |
|---|---|---|
| Editar monto | BGT-R03 | `TransactionAmountChanged` |
| Cambiar fecha (cruzando período) | BGT-R04 | `TransactionDateChanged` |
| Cambiar categoría | BGT-R05 | `TransactionCategoryChanged` |
| Eliminar transacción | BGT-R06 | `TransactionDeleted` |

---

#### BGT-R07 — El presupuesto nunca bloquea una transacción

**Regla**: Informativo, nunca restrictivo. El sistema informa, el usuario decide.

---

#### BGT-R08 — Alertas en dos umbrales

1. Al `alert_threshold`% → `BudgetThresholdReached`
2. Al superar 100% → `BudgetExceeded`

---

## 7. Metas de Ahorro

#### GOL-R01 — Progreso manual en MVP

**Regla**: Las metas no se alimentan automáticamente de transacciones en MVP.

---

#### GOL-R02 — La fecha objetivo es opcional

**Regla**: `target_date` puede ser `NULL`. Si existe, no puede ser anterior a la fecha de creación.

---

#### GOL-R03 — El monto actual no puede superar el objetivo

**Regla**: `current_amount <= target_amount`. Si un aporte excede, se limita y la meta pasa a `COMPLETED`.

---

#### GOL-R04 — Metas completadas son inmutables

**Regla**: `COMPLETED` no puede cambiar `target_amount`, retroceder, ni reducir `current_amount`.

---

#### GOL-R05 — Metas pausadas conservan progreso pero no generan alertas

**Regla**: `PAUSED` no puede pasar directamente a `COMPLETED`. Debe pasar por `ACTIVE` primero.

---

#### GOL-R06 — Metas vencidas no se cierran automáticamente

**Regla**: Solo notificación. El usuario decide: extender fecha, pausar o eliminar.

---

## 8. Máquinas de Estado

Transiciones válidas. Cualquier transición no listada está **prohibida**.

### 8.1 Meta de Ahorro

```
                    ┌──────────┐
          ┌────────►│  ACTIVE  │◄────────┐
          │         └────┬─────┘         │
          │              │               │
     reactivar      pause / complete  reactivar
          │              │               │
          │         ┌────▼─────┐   ┌─────┴────┐
          └─────────│  PAUSED  │   │COMPLETED │ ← inmutable
                    └──────────┘   └──────────┘

ACTIVE    → PAUSED      ✅
ACTIVE    → COMPLETED   ✅ (cuando current_amount >= target_amount)
PAUSED    → ACTIVE      ✅
PAUSED    → COMPLETED   ❌ PROHIBIDO
COMPLETED → cualquier   ❌ PROHIBIDO
```

### 8.2 Cuenta

```
         ┌──────────┐
    ┌───►│  ACTIVE  │
    │    └────┬─────┘
    │         │ archive (soft delete)
  restore     │
    │    ┌────▼─────┐
    └────│ ARCHIVED │
         └──────────┘

ACTIVE   → ARCHIVED   ✅
ARCHIVED → ACTIVE     ✅ (feature futura: restaurar)
```

### 8.3 Presupuesto

```
         ┌──────────┐
         │  ACTIVE  │
         └─────┬────┘
         ┌─────┴──────┐
         │            │
      expire      deactivate
         │            │
    ┌────▼─────┐  ┌───▼──────┐
    │ EXPIRED  │  │INACTIVE  │
    └──────────┘  └──────────┘

ACTIVE   → EXPIRED    ✅ (automático al vencer end_date)
ACTIVE   → INACTIVE   ✅ (categoría eliminada / usuario desactiva)
EXPIRED  → ACTIVE     ❌ Crear nuevo presupuesto
INACTIVE → ACTIVE     ✅ (reactivación manual)
```

### 8.4 Categoría

```
ACTIVE   → DELETED   ✅ (solo si sin transacciones)
DELETED  → ACTIVE    ❌ No implementado en MVP
is_system → cualquier ❌ Las categorías del sistema son permanentes
```

### 8.5 Transacción

```
ACTIVE  → DELETED   ✅ (siempre posible)
DELETED → ACTIVE    ❌ Crear transacción nueva si fue error
```

---

## 9. Application Rules

> [!NOTE]
> Estas son decisiones técnicas que soportan las invariantes de negocio. El negocio no conoce "audit log" o "soft delete" como conceptos — son mecanismos de implementación, no reglas del dominio financiero.

| ID | Regla técnica | Invariante que soporta |
|---|---|---|
| **AR-01** | Toda operación de escritura genera un audit log con estado anterior y nuevo | G-04, G-05 |
| **AR-02** | `WHERE deleted_at IS NULL` en todos los queries de listado | G-04 |
| **AR-03** | Actualizaciones de `current_balance` usan incremento atómico SQL (`current_balance + :delta`) | G-07 |
| **AR-04** | Ningún endpoint de datos financieros accesible sin sesión válida | SYS-R01 |
| **AR-05** | Domain Events que modifican agregados distintos son síncronos con la transacción de DB cuando afectan consistencia | G-01, G-03 |

---

## 10. Reglas Deliberadamente NO Implementadas

> [!NOTE]
> Estas son decisiones tomadas conscientemente, no olvidos. Si alguien pregunta "¿por qué no hicimos X?", la respuesta está aquí.

| Funcionalidad | Razón de exclusión |
|---|---|
| **Contabilidad doble (Double-entry)** | Requiere modelo contable completo (débitos/créditos, libro mayor) que va más allá de finanzas personales |
| **Multiusuario colaborativo** | Introduce permisos por recurso, conflictos de edición simultánea y complejidad sin valor para usuario individual |
| **Conversión automática de monedas** | Implica API de tipos de cambio, tasas históricas y decisiones de qué tasa usar. El usuario declara montos explícitamente |
| **Presupuestos negativos** | Sin sentido financiero. Las deudas se modelan con cuentas de tipo CREDIT |
| **Reglas tributarias** | Específicas por jurisdicción, cambian frecuentemente, requieren asesoría legal |
| **Transferencias programadas/recurrentes** | Feature de Fase 2. MVP solo soporta transferencias inmediatas |
| **Categorías compartidas entre usuarios** | Cada usuario tiene su propio árbol. Categorías del sistema son el punto de referencia común |
| **Reconciliación bancaria automática** | Requiere OCR y parseo de formatos variados. Fase 4+ |
| **Proyecciones financieras automáticas** | Requiere modelos ML con historial suficiente. Fase 4+ |
| **Balance consolidado multi-moneda** | Implica tasas de cambio y decisiones de conversión. Feature futura |

---

## 11. Matriz de Decisiones para Casos Extremos

| Caso extremo | Decisión | Regla |
|---|---|---|
| Eliminar cuenta con balance ≠ 0 | ✅ Permitido con advertencia | ACC-R04 |
| Transferencia entre monedas distintas | ✅ Permitido, montos declarados manualmente | TRF-R04 |
| Transacción que cruza período al editar fecha | ✅ Reasigna presupuestos via Domain Event | BGT-R04 |
| Categoría padre con subcategorías: ¿eliminar? | ✅ Solo si ninguna tiene transacciones | CAT-R05 |
| Presupuesto excedido: ¿bloquea? | ❌ Nunca. Solo informa | BGT-R07 |
| Meta completada: ¿puede revertirse? | ❌ Nunca. Crear nueva meta | GOL-R04 |
| Meta vencida sin completar: ¿se cierra? | ❌ Solo notifica, usuario decide | GOL-R06 |
| Transacción recategorizada: ¿reasigna presupuesto? | ✅ Automáticamente via Domain Event | BGT-R05 |
| Balance inicial: ¿editable con transacciones? | ❌ Inmutable | ACC-R02 |
| Categoría con transacciones soft-deleted: ¿eliminar? | ❌ El historial soft-deleted es historial | CAT-R04 |
| Subcategoría: ¿tipo distinto al padre? | ❌ Siempre hereda | CAT-R02 |
| Transferencia: ¿editar un solo lado? | ❌ Eliminar y recrear | TRF-R05 |
| ¿Balance puede ser negativo? | ✅ Sí (cuentas de crédito) | Sin restricción |
| Meta PAUSED: ¿completarse directamente? | ❌ Debe pasar por ACTIVE | §8.1 |
| Transferencia fallida a mitad | ❌ Imposible por diseño (atómica) | TRF-R02 |

---

## 12. Glosario del Dominio

Vocabulario del **lenguaje ubicuo**. El código, los documentos y las conversaciones usan estos términos consistentemente.

| Término | Definición |
|---|---|
| **Transacción** | Registro de movimiento de dinero: INCOME, EXPENSE o TRANSFER |
| **Ingreso (INCOME)** | Transacción que aumenta el balance |
| **Egreso (EXPENSE)** | Transacción que disminuye el balance |
| **Transferencia (TRANSFER)** | Movimiento entre dos cuentas. Genera dos transacciones vinculadas por `transfer_pair_id` |
| **Cuenta** | Contenedor de dinero: bancaria, efectivo, inversión, crédito |
| **Balance** | Saldo actual. Siempre almacenado, nunca calculado en runtime |
| **Balance inicial** | Saldo antes de registrar transacciones en el sistema |
| **Categoría** | Etiqueta jerárquica para clasificar transacciones. Máximo 2 niveles |
| **Categoría del sistema** | Predefinida, inmutable, disponible para todos los usuarios |
| **Presupuesto** | Límite de gasto para una categoría en un período. Informativo, nunca restrictivo |
| **Período** | Intervalo temporal del presupuesto: MONTHLY, WEEKLY, YEARLY |
| **Meta de ahorro** | Objetivo financiero con monto objetivo y fecha opcional |
| **Soft delete** | Eliminación lógica. `deleted_at` indica el momento, el registro persiste |
| **Domain Event** | Notificación de que algo ocurrió. Ej: `TransactionCreated` |
| **Money** | Value Object: monto (big.js) + moneda (ISO 4217). Nunca un float |
| **Invariante** | Regla que el sistema garantiza siempre. No puede violarse |
| **Application Rule** | Decisión técnica que soporta invariantes del negocio |
| **Lenguaje ubicuo** | Vocabulario compartido entre dominio y código |

---

> [!NOTE]
> **Próximo documento**: `03-domain-model.md`
> El Domain Model traduce estas Business Rules en entidades, Value Objects, agregados y contratos de repositorios.

---

*Documento 02 de 07 — MyMoney Business Rules v1.1 — Julio 2026*
