# MyMoney — Domain Model

> **Documento**: 03 de 07
> **Versión**: 1.2.0 — Julio 2026
> **Estado**: APROBADO — congelado
> **Dependencias**: `01-architecture.md` (v2.1), `02-business-rules.md` (v1.1)
> **Siguiente documento**: `04-erd.md`

---

> [!IMPORTANT]
> Este documento es la traducción técnica de las Business Rules al lenguaje del dominio. Cada entidad, Value Object y contrato de repositorio aquí definido debe implementar fielmente las reglas de `02-business-rules.md`. Si hay contradicción, el documento de Business Rules tiene precedencia.

---

## Índice

1. [Lenguaje Ubicuo — Resumen](#1-lenguaje-ubicuo--resumen)
2. [Value Objects](#2-value-objects)
3. [Domain Exception Hierarchy](#3-domain-exception-hierarchy)
4. [Entidades](#4-entidades)
5. [Agregados](#5-agregados)
6. [Domain Events — Catálogo completo](#6-domain-events--catálogo-completo)
7. [Interfaces de Repositorios](#7-interfaces-de-repositorios)
8. [Domain Services](#8-domain-services)
9. [Invariantes implementadas — Trazabilidad](#9-invariantes-implementadas--trazabilidad)

---

## 1. Lenguaje Ubicuo — Resumen

El código usa exactamente estos términos. Sin sinónimos, sin variaciones.

| Concepto              | Clase/Tipo en código                  | Módulo         |
| --------------------- | ------------------------------------- | -------------- |
| Transacción           | `Transaction`                         | `transactions` |
| Ingreso               | `TransactionType.INCOME`              | `transactions` |
| Egreso                | `TransactionType.EXPENSE`             | `transactions` |
| Transferencia         | `TransactionType.TRANSFER`            | `transactions` |
| Cuenta                | `Account`                             | `accounts`     |
| Balance               | `Money` (en `Account.currentBalance`) | `accounts`     |
| Balance inicial       | `Account.initialBalance`              | `accounts`     |
| Categoría             | `Category`                            | `categories`   |
| Subcategoría          | `Category` con `parentId != null`     | `categories`   |
| Categoría del sistema | `Category` con `isSystem = true`      | `categories`   |
| Presupuesto           | `Budget`                              | `budgets`      |
| Período               | `BudgetPeriod`                        | `budgets`      |
| Meta de ahorro        | `Goal`                                | `goals`        |
| Progreso de meta      | `Goal.currentAmount`                  | `goals`        |
| Monto financiero      | `Money`                               | `shared`       |
| Moneda                | `Currency`                            | `shared`       |
| Par de transferencia  | `TransferPair`                        | `transactions` |

---

## 2. Value Objects

Los Value Objects son inmutables. No tienen identidad propia. Dos Value Objects son iguales si sus valores son iguales. Contienen lógica de validación — son el primer punto donde se lanzan excepciones de dominio.

### 2.1 Money

```typescript
// packages/shared/src/domain/money.value-object.ts

class Money {
  private constructor(
    readonly value: Big, // big.js — nunca float, nunca decimal nativo
    readonly currency: Currency, // ISO 4217
  ) {}

  // Factory methods — única forma de crear Money
  static of(value: number | string, currency: Currency): Money;
  // Lanza InvariantViolationException si value <= 0 (TRX-R01)
  // Money SIEMPRE representa un monto positivo. El efecto (aumentar/disminuir
  // el balance) lo determina BalanceDelta.direction, nunca el signo de Money.

  static zero(currency: Currency): Money;

  // Operaciones — siempre retornan nuevo Money (inmutabilidad)
  add(other: Money): Money; // lanza si monedas distintas
  subtract(other: Money): Money; // lanza si monedas distintas. Resultado siempre >= 0
  multiply(factor: number): Money;

  // Comparaciones
  isGreaterThan(other: Money): boolean;
  isLessThan(other: Money): boolean;
  equals(other: Money): boolean;
  isZero(): boolean;
  isPositive(): boolean; // value > 0
  sameCurrency(other: Money): boolean;

  // Formateo
  format(locale?: string): string; // "$1,250.00" | "MX$1,250.00" | "€1.250,00"
  toJSON(): { value: string; currency: string };
}
```

**Reglas que implementa**: TRX-R01 (monto positivo), G-03 (conservación en transferencias).

---

### 2.2 BalanceDelta

```typescript
// packages/shared/src/domain/balance-delta.value-object.ts

// Resuelve la contradicción: Money siempre positivo,
// pero los balances pueden subir o bajar.
// BalanceDelta separa el «cuánto» (Money) del «en qué dirección».

enum BalanceDirection {
  INCREASE = "INCREASE", // El balance sube (INCOME, destino de TRANSFER)
  DECREASE = "DECREASE", // El balance baja (EXPENSE, origen de TRANSFER)
}

class BalanceDelta {
  private constructor(
    readonly amount: Money, // siempre positivo
    readonly direction: BalanceDirection,
  ) {}

  static increase(amount: Money): BalanceDelta;
  static decrease(amount: Money): BalanceDelta;

  // Invierte la dirección (útil al revertir una transacción eliminada)
  reverse(): BalanceDelta;

  // Calcula el nuevo balance
  applyTo(currentBalance: Money): Money;
  // Si INCREASE: currentBalance.add(amount)
  // Si DECREASE: currentBalance.subtract(amount)
  // No lanza si el resultado es negativo — las cuentas CREDIT pueden tener balance negativo
}
```

**Por qué existe**: `Account.applyBalanceDelta()` recibía antes un `Money` con delta positivo o negativo, creando una contradicción con la invariante G-07 y TRX-R01. Ahora `BalanceDelta` encapsula dirección y monto de forma explícita y semánticamente correcta.

---

### 2.3 Currency

```typescript
// packages/shared/src/domain/currency.value-object.ts

enum Currency {
  USD = "USD",
  EUR = "EUR",
  MXN = "MXN",
  COP = "COP",
  ARS = "ARS",
  BRL = "BRL",
  CLP = "CLP",
  PEN = "PEN",
  // Extensible sin modificar lógica existente
}

class CurrencyVO {
  static isValid(code: string): boolean;
  static fromCode(code: string): Currency; // lanza si no es ISO 4217 válido
  static decimalPlaces(currency: Currency): number; // USD=2, JPY=0, BHD=3
}
```

---

### 2.4 DateRange

> [!NOTE]
> `DateRange` está documentado aquí como Value Object prospectivo pero **no existe en el código actual** (`packages/shared/src/domain/`). Los módulos implementados (Accounts, Categories, Transactions) trabajan con `Date` nativo directamente.
>
> Para el módulo `Budgets`, `startDate` y `endDate` se tratarán como propiedades `Date` independientes en la entidad, consistente con la arquitectura existente. No se introduce `DateRange` como VO para este módulo.

---

### 2.5 TransactionType

```typescript
enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}
// TRX-R05: el tipo es inmutable — solo se asigna en el constructor de Transaction.
```

---

### 2.6 AccountType

```typescript
enum AccountType {
  CHECKING = "CHECKING",
  SAVINGS = "SAVINGS",
  CASH = "CASH",
  CREDIT = "CREDIT",
  INVESTMENT = "INVESTMENT",
}
```

---

### 2.7 TransactionDate

```typescript
// Encapsula la validación de TRX-R02 y TRX-R03

class TransactionDate {
  private constructor(readonly value: Date) {}

  static of(date: Date): TransactionDate;
  // Lanza InvariantViolationException(TRX_004) si date > today + 7 días

  isBefore(other: TransactionDate): boolean;
  isInSamePeriod(other: TransactionDate, period: BudgetPeriod): boolean;
  toDate(): Date;
}
```

---

## 3. Domain Exception Hierarchy

El dominio tiene una jerarquía de excepciones que separa las causas de fallo. Los Use Cases y controladores capturan por tipo — no por mensaje de string.

```typescript
// packages/shared/src/domain/exceptions/

// Base — toda excepción del dominio extiende de aquí
class DomainException extends Error {
  constructor(
    readonly code: string, // ej: 'TRX_003'
    readonly message: string,
    readonly context?: Record<string, unknown>,
  ) {}
}

// Datos de entrada inválidos (el usuario cometió un error de formato o valor)
// Mapeado a HTTP 400
class ValidationException extends DomainException {
  constructor(
    code: string,
    message: string,
    readonly field?: string,
  ) {}
}

// Una regla de negocio explícita fue violada
// Mapeado a HTTP 409 o 422
class BusinessRuleViolationException extends DomainException {
  constructor(
    code: string,
    message: string,
    readonly rule?: string,
  ) {}
}

// Una invariante del sistema fue violada (no debería ocurrir si el sistema está bien)
// Mapeado a HTTP 500 — indica un bug, no un error del usuario
class InvariantViolationException extends DomainException {
  constructor(code: string, message: string) {}
}

// Conflicto de escritura concurrente (optimistic locking)
// Mapeado a HTTP 409
class ConcurrencyException extends DomainException {
  constructor(entityId: string, entityType: string) {}
}

// Feature desactivada por feature flag
// Mapeado a HTTP 503
class FeatureNotAvailableException extends DomainException {
  constructor(featureKey: string) {}
}
```

### Guía de uso

| Situación                                    | Tipo de excepción                |
| -------------------------------------------- | -------------------------------- |
| Monto negativo o cero (`TRX_003`)            | `ValidationException`            |
| Fecha futura > 7 días (`TRX_004`)            | `ValidationException`            |
| Presupuesto duplicado (`BGT_003`)            | `BusinessRuleViolationException` |
| Categoría del sistema modificada (`CAT_002`) | `BusinessRuleViolationException` |
| Balance modificado directamente              | `InvariantViolationException`    |
| Monedas incompatibles en operación           | `InvariantViolationException`    |
| Edición simultánea del mismo recurso         | `ConcurrencyException`           |
| OCR desactivado por feature flag             | `FeatureNotAvailableException`   |

---

## 4. Entidades

Las Entidades tienen identidad propia (ID único). Pueden mutar su estado a través de métodos explícitos. Sus invariantes se verifican en cada mutación.

### 3.1 Transaction

```typescript
// modules/transactions/domain/transaction.entity.ts

class Transaction {
  // Propiedades — solo lectura externamente
  readonly id: TransactionId; // UUID
  readonly userId: UserId;
  readonly accountId: AccountId;
  readonly type: TransactionType; // inmutable (TRX-R05)
  private _categoryId: CategoryId | null;
  private _amount: Money;
  private _description: string | null;
  private _notes: string | null;
  private _date: TransactionDate;
  readonly transferPairId: TransferId | null; // solo en TRANSFER
  readonly metadata: TransactionMetadata; // JSONB extensible
  readonly createdAt: Date;
  readonly createdBy: UserId;
  private _updatedAt: Date;
  private _updatedBy: UserId;
  private _deletedAt: Date | null;
  private _deletedBy: UserId | null;

  // Factory — única forma de crear
  static create(props: CreateTransactionProps): Transaction;
  // Valida: amount > 0 (TRX-R01), date válida (TRX-R03), categoría compatible (TRX-R04)

  // Mutaciones — cada una publica el Domain Event correspondiente
  updateAmount(
    newAmount: Money,
    updatedBy: UserId,
  ): TransactionAmountChangedEvent;
  updateDate(
    newDate: TransactionDate,
    updatedBy: UserId,
  ): TransactionDateChangedEvent;
  updateCategory(
    newCategoryId: CategoryId,
    updatedBy: UserId,
  ): TransactionCategoryChangedEvent;
  updateDescription(description: string | null, updatedBy: UserId): void;
  softDelete(deletedBy: UserId): TransactionDeletedEvent;

  // Consultas
  isDeleted(): boolean;
  isTransfer(): boolean;
  affectsBalance(): "increase" | "decrease"; // INCOME=increase, EXPENSE=decrease
  belongsToUser(userId: UserId): boolean;

  // Validaciones internas — llamadas en el constructor y en cada mutación
  private validateAmount(amount: Money): void; // TRX-R01
  private validateDate(date: TransactionDate): void; // TRX-R03
  private validateCategoryCompatibility( // TRX-R04
    categoryType: CategoryType,
    transactionType: TransactionType,
  ): void;
}
```

**Reglas implementadas**: TRX-R01 al TRX-R11.

---

### 3.2 Account

```typescript
// modules/accounts/domain/account.entity.ts

class Account {
  readonly id: AccountId;
  readonly userId: UserId;
  readonly type: AccountType;
  readonly currency: Currency; // inmutable — define la moneda de la cuenta
  readonly initialBalance: Money; // inmutable después de primera transacción (ACC-R02)
  private _currentBalance: Money; // solo actualizable via applyBalanceDelta (ACC-R03)
  private _name: string;
  private _color: string | null;
  private _icon: string | null;
  private _transactionCount: number; // para verificar ACC-R02
  // campos de auditoría...

  static create(props: CreateAccountProps): Account;

  // La ÚNICA forma de modificar currentBalance (ACC-R03, G-07)
  applyBalanceDelta(
    delta: BalanceDelta,
    reason: BalanceChangeReason,
  ): AccountBalanceChangedEvent;
  // reason: 'TRANSACTION_CREATED' | 'TRANSACTION_DELETED' | 'TRANSACTION_AMOUNT_CHANGED'
  //
  // Guarda de moneda: lanza InvariantViolationException si
  // delta.amount.currency !== this.currency
  // Porque mezclar monedas en el balance de una cuenta viola G-01.

  updateInitialBalance(newBalance: Money, updatedBy: UserId): void;
  // Lanza BusinessRuleViolationException(ACC_004) si _transactionCount > 0

  incrementTransactionCount(): void; // llamado al crear transacción
  decrementTransactionCount(): void; // nunca decrece (soft delete no elimina count)

  archive(deletedBy: UserId): AccountArchivedEvent;
  restore(restoredBy: UserId): AccountRestoredEvent;

  // Consultas
  isActive(): boolean;
  canModifyInitialBalance(): boolean; // _transactionCount === 0
  currentBalance(): Money; // getter — nunca setter público
}

// No existe setCurrentBalance().
// currentBalance es readonly externamente.
// Solo applyBalanceDelta() lo modifica — siempre desde handler de Domain Event.
```

**Reglas implementadas**: ACC-R01 al ACC-R05, G-07.

---

### 3.3 Category

```typescript
// modules/categories/domain/category.entity.ts
//
// DECISIÓN DE AGREGADO (ver §5): Category es su propio Aggregate Root.
// Las subcategorías son Category independientes que referencian parentId.
// No se cargan como parte del agregado padre — se consultan por separado.
// Esto simplifica el repositorio y evita cargar toda la jerarquía innecesariamente.

class Category {
  readonly id: CategoryId;
  readonly userId: UserId | null; // null = categoría del sistema
  readonly parentId: CategoryId | null; // null = raíz; referencia a otro Aggregate Root
  readonly isSystem: boolean;
  private _name: string;
  private _type: CategoryType; // INCOME | EXPENSE | BOTH
  private _icon: string | null;
  private _color: string | null;
  // campos de auditoría...

  static create(props: CreateCategoryProps): Category;
  static createSubcategory(
    props: CreateSubcategoryProps,
    parent: Category,
  ): Category;
  // Recibe el padre SOLO para leer parent.type y parent.isRoot()
  // Fuerza _type = parent._type (CAT-R02)
  // Lanza si parent.isSubcategory() — no se puede crear sub-subcategoría (CAT-R01)

  updateName(name: string, updatedBy: UserId): void;
  // Lanza BusinessRuleViolationException(CAT_002) si isSystem === true

  softDelete(deletedBy: UserId): CategoryDeletedEvent;
  // Lanza BusinessRuleViolationException(CAT_002) si isSystem === true
  // El evento incluye categoryId — el Use Case FindAndDeleteSubcategories
  // consulta ICategoryRepository.findSubcategories() y hace softDelete() en cada una

  isCompatibleWith(transactionType: TransactionType): boolean;
  // INCOME compatible con INCOME y BOTH
  // EXPENSE compatible con EXPENSE y BOTH

  isRoot(): boolean; // parentId === null
  isSubcategory(): boolean; // parentId !== null
}
```

**Reglas implementadas**: CAT-R01 al CAT-R06.

---

### 3.4 Budget

```typescript
// modules/budgets/domain/budget.entity.ts

enum BudgetPeriod {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

enum BudgetStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED", // end_date pasó — automático
  INACTIVE = "INACTIVE", // desactivado manualmente o por CategoryDeleted
}

interface CreateBudgetProps {
  userId: string;
  categoryId: string;
  period: BudgetPeriod;
  amount: Money; // límite del presupuesto — amount.currency define la moneda del budget
  startDate: Date;
  // endDate NO es recibido del cliente — el backend lo calcula a partir de period + startDate:
  //   WEEKLY:  startDate + 6 días
  //   MONTHLY: último día del mes de startDate
  //   YEARLY:  último día del año de startDate (31 de diciembre)
  alertThreshold?: number; // 1-100, default 80
}

class Budget {
  readonly id: string;
  readonly userId: string;
  readonly categoryId: string; // inmutable (no editable via API)
  readonly period: BudgetPeriod; // inmutable (no editable via API)
  readonly startDate: Date; // inmutable (no editable via API)
  readonly endDate: Date; // calculado en create(), inmutable
  private _amount: Money; // editable via updateAmount()
  private _alertThreshold: number; // editable via updateAlertThreshold()
  private _executedAmount: Money; // SOLO via applyTransactionDelta() — NUNCA desde DTO
  private _status: BudgetStatus; // máquina de estado §8.3
  // campos de auditoría estándar: createdAt, updatedAt, createdBy, updatedBy
  // NO tiene deleted_at ni deleted_by — Budget no usa soft-delete.
  // El ciclo de vida se gestiona exclusivamente mediante _status (ACTIVE/EXPIRED/INACTIVE).

  // ── Factory ──────────────────────────────────────────────────────────

  static create(props: CreateBudgetProps): Budget;
  // Validaciones:
  //   • amount.value > 0              → ValidationException('BGT_001')
  //   • alertThreshold entre 1 y 100  → ValidationException('BGT_002')
  // Cálculo de endDate según period:
  //   • WEEKLY:  startDate + 6 días
  //   • MONTHLY: último día del mes de startDate
  //   • YEARLY:  31 de diciembre del año de startDate
  // Inicializa _executedAmount = Money.zero(amount.currency)
  // Inicializa _status = ACTIVE
  // La unicidad (BGT-R01) la verifica el Use Case con IBudgetRepository.existsActiveBudget()

  static reconstitute(props: BudgetProps): Budget;
  // Desde persistencia. Sin validaciones de negocio.

  // ── Mutaciones explícitas ────────────────────────────────────────────

  updateAmount(newAmount: Money, updatedBy: string): void;
  // Permite cambiar el límite del presupuesto.
  // Lanza ValidationException('BGT_001') si newAmount.value <= 0
  // Lanza BusinessRuleViolationException si _status !== ACTIVE
  // _executedAmount no cambia — executionPercentage() se recalcula automáticamente

  updateAlertThreshold(threshold: number, updatedBy: string): void;
  // Lanza ValidationException('BGT_002') si threshold < 1 || threshold > 100
  // Lanza BusinessRuleViolationException si _status !== ACTIVE

  applyTransactionDelta(
    delta: BalanceDelta,
    transactionDate: Date,
  ): BudgetThresholdReachedEvent | BudgetExceededEvent | null;
  // ────────────────────────────────────────────────────────────────────
  // INVARIANTE CRÍTICA: Este es el ÚNICO punto donde _executedAmount cambia.
  // Nunca desde Controller, DTO, Repository ni ningún otro lugar.
  // ────────────────────────────────────────────────────────────────────
  // Solo actúa si isActive() && containsDate(transactionDate).
  // Si no cumple ambas condiciones, retorna null sin modificar nada.
  //
  // delta.INCREASE: _executedAmount += delta.amount (EXPENSE creado/aumentado)
  // delta.DECREASE: _executedAmount -= delta.amount, mínimo Money.zero()
  //
  // Evalúa umbrales DESPUÉS de aplicar:
  //   • executionPercentage() cruzó alertThreshold → BudgetThresholdReachedEvent
  //   • executionPercentage() cruzó 100%           → BudgetExceededEvent
  // "Cruzó" = valor anterior < umbral && valor nuevo >= umbral (una sola vez)

  expire(): void;
  // ACTIVE → EXPIRED. Lanza BusinessRuleViolationException si _status !== ACTIVE.
  //
  // Política de expiración — cuándo se llama a este método:
  //   Condición: today > end_date  (la fecha actual es posterior al fin del período)
  //
  //   Mecanismo Único — Lazy check (al vuelo):
  //     Antes de aplicar applyTransactionDelta() o devolver el DTO en un GET,
  //     se evalúa si el budget superó su fecha límite. Si es así, se llama a expire(),
  //     y se persiste en la base de datos de manera transparente.
  //     (Nota: El cron job planificado originalmente se descartó en la implementación
  //      en favor de la evaluación perezosa para reducir complejidad e infraestructura).
  //     el Use Case verifica: if (!budget.containsDate(today)) budget.expire().
  //     Esto garantiza que un budget nunca aparece como ACTIVE en la API si ya venció,
  //     incluso si el job aún no corrió.
  //
  // Ambos mecanismos son idempotentes: si el budget ya está EXPIRED, expire() lanza
  // y el llamador captura silenciosamente (no es un error para el usuario).
  // El estado final siempre es consistente.

  deactivate(reason: "CATEGORY_DELETED" | "USER_REQUEST"): void;
  // ACTIVE → INACTIVE. Lanza BusinessRuleViolationException si _status !== ACTIVE.

  reactivate(updatedBy: string): void;
  // INACTIVE → ACTIVE.
  // Lanza BusinessRuleViolationException si _status !== INACTIVE.
  // IMPORTANTE: Este método solo cambia _status. La validación de unicidad
  // (BGT-R01) se comprueba en el Use Case ReactivateBudget ANTES de llamar
  // a este método. Si existsActiveBudget() retorna true → falla con BGT_003
  // antes de que reactivate() sea invocado. El agregado no consulta el repo.

  // Consultas
  executionPercentage(): number; // (_executedAmount / _amount) * 100. Puede > 100.
  remainingAmount(): Money; // _amount - _executedAmount. Puede ser negativo.
  availableAmount(): Money; // max(remainingAmount(), Money.zero()). Siempre >= 0.
  isOverBudget(): boolean; // _executedAmount > _amount
  isActive(): boolean; // _status === ACTIVE
  containsDate(date: Date): boolean; // startDate <= date <= endDate
  belongsToUser(userId: string): boolean;
}
```

**Reglas implementadas**: BGT-R01 al BGT-R08, §8.3 (máquina de estado).

---

### 3.5 Goal

```typescript
// modules/goals/domain/goal.entity.ts

class Goal {
  readonly id: GoalId;
  readonly userId: UserId;
  readonly createdAt: Date;
  private _name: string;
  private _targetAmount: Money;
  private _currentAmount: Money;
  private _targetDate: Date | null;
  private _status: GoalStatus; // ACTIVE | PAUSED | COMPLETED
  // campos de auditoría...

  static create(props: CreateGoalProps): Goal;
  // Valida: targetAmount > 0 (GOL-R02)
  // Valida: targetDate >= createdAt si existe (GOL-R02)

  // Máquina de estado — reglas de transición (§8.1 de Business Rules)
  addProgress(
    amount: Money,
    updatedBy: UserId,
  ): GoalProgressUpdatedEvent | GoalCompletedEvent;
  // Si currentAmount + amount >= targetAmount:
  //   → _currentAmount = _targetAmount (no puede superar, GOL-R03)
  //   → _status = COMPLETED
  //   → GoalCompletedEvent
  // Si currentAmount + amount < targetAmount:
  //   → GoalProgressUpdatedEvent

  pause(updatedBy: UserId): void;
  // Solo desde ACTIVE. Lanza BusinessRuleViolationException si status !== ACTIVE

  activate(updatedBy: UserId): GoalCompletedEvent | void;
  // Solo desde PAUSED. Lanza si status !== PAUSED
  // Si al reactivar currentAmount >= targetAmount → COMPLETED directamente

  // Consultas
  progressPercentage(): number; // (currentAmount / targetAmount) * 100
  remainingAmount(): Money; // targetAmount - currentAmount
  // Muy usado en la UI: "Te faltan $X para tu meta"
  isCompleted(): boolean;
  isExpired(): boolean; // targetDate < today && !isCompleted()

  // Invariante GOL-R04: llamado en inicio de addProgress() y activate()
  private assertNotCompleted(): void;
  // Lanza InvariantViolationException si _status === COMPLETED
}
```

**Reglas implementadas**: GOL-R01 al GOL-R06, §8.1.

---

### 3.6 User

```typescript
// modules/users/domain/user.entity.ts

class User {
  readonly id: UserId;
  private _email: Email; // Value Object con validación de formato
  private _name: string;
  private _passwordHash: string;
  readonly role: UserRole; // USER | ADMIN | SUPER_ADMIN
  private _isActive: boolean;
  private _emailVerified: boolean;
  // campos de auditoría...

  static create(props: CreateUserProps): User;
  static reconstitute(props: UserProps): User; // desde persistencia

  updateProfile(name: string, updatedBy: UserId): void;
  updatePasswordHash(hash: string): void;
  verifyEmail(): void;
  deactivate(): void;
}
```

---

## 5. Agregados

Un **Agregado** es un grupo de entidades que se trata como una unidad para cambios de datos. Solo la raíz del agregado es accesible desde fuera.

### Decisión de agregados

```
Agregado: Transaction
  Raíz: Transaction
  Por qué: Transaction es la entidad más atómica del dominio.
           Attachments se gestionan por referencia (transaction_id),
           no como parte del agregado.

Agregado: Account
  Raíz: Account
  Por qué: El balance es una invariante local de Account.
           Nadie externo modifica el balance directamente.

Agregado: Category  ← DECISIÓN: Opción A — cada Category es su propio Aggregate Root
  Raíz: Category (raíz o subcategoría)
  Por qué: Las subcategorías se consultan de forma independiente
           (ICategoryRepository.findSubcategories). Si fueran miembros del agregado
           padre, habría que cargar toda la jerarquía en cada acceso.
           La invariante de tipo (CAT-R02) se valida en Category.createSubcategory(),
           que recibe el padre como parámetro de solo lectura sin ser parte del agregado.
           La eliminación en cascada la coordina el Use Case, no el agregado.

Agregado: Budget
  Raíz: Budget
  Por qué: El monto ejecutado y el estado son invariantes locales del presupuesto.

Agregado: Goal
  Raíz: Goal
  Por qué: El progreso y el estado son locales a la meta.

Agregado: User
  Raíz: User
  Por qué: Las sesiones se gestionan por referencia (user_id).
```

### Regla de agregados

> Ningún Use Case accede a los internos de un agregado a través de otro agregado.
>
> Si `BudgetModule` necesita datos de `Transaction`, los recibe via Domain Event, no accediendo directamente a `TransactionRepository`.

---

## 6. Domain Events — Catálogo completo

Los Domain Events son la forma en que los agregados se comunican sin conocerse. Cada evento contiene los datos mínimos necesarios para que los handlers reaccionen sin queries adicionales.

### Convención de nomenclatura

```
[Entidad][AcciónPasado]Event
Ejemplo: TransactionCreatedEvent, AccountBalanceChangedEvent
```

### Base DomainEvent

Todos los eventos heredan de esta clase base. El `correlationId` permite rastrear todos los eventos de una operación compleja (ej: crear una transferencia genera 4+ eventos).

```typescript
// packages/shared/src/domain/events/domain-event.base.ts

abstract class DomainEvent {
  readonly eventId: string; // UUID único del evento
  readonly occurredAt: Date; // cuándo ocurrió
  readonly version: number; // para versionado de eventos (default: 1)
  readonly requestId: string; // X-Request-ID del HTTP request que lo originó
  readonly correlationId: string; // agrupa todos los eventos de una operación lógica
  // Ejemplo: CreateTransfer genera 2 TransactionCreated + 2 AccountBalanceChanged,
  // todos con el mismo correlationId → permite reconstruir la operación completa

  constructor(props: DomainEventProps) {}
}

// Cada evento concreto extiende DomainEvent y agrega sus campos propios:
class TransactionCreatedEvent extends DomainEvent {
  readonly type = "TransactionCreated" as const;
  // ...campos específicos
}
```

### Catálogo

```typescript
// TRANSACCIONES
interface TransactionCreatedEvent {
  type: "TransactionCreated";
  transactionId: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  amount: { value: string; currency: string }; // Money serializado
  transactionType: TransactionType;
  date: string; // ISO 8601
  transferPairId: string | null;
}

interface TransactionAmountChangedEvent {
  type: "TransactionAmountChanged";
  transactionId: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  previousAmount: { value: string; currency: string };
  newAmount: { value: string; currency: string };
  delta: { value: string; currency: string }; // new - previous
  transactionType: TransactionType;
  date: string;
}

interface TransactionDateChangedEvent {
  type: "TransactionDateChanged";
  transactionId: string;
  userId: string;
  categoryId: string | null;
  amount: { value: string; currency: string };
  transactionType: TransactionType;
  previousDate: string;
  newDate: string;
}

interface TransactionCategoryChangedEvent {
  type: "TransactionCategoryChanged";
  transactionId: string;
  userId: string;
  amount: { value: string; currency: string };
  transactionType: TransactionType;
  date: string;
  previousCategoryId: string | null;
  newCategoryId: string | null;
}

interface TransactionDeletedEvent {
  type: "TransactionDeleted";
  transactionId: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  amount: { value: string; currency: string };
  transactionType: TransactionType;
  date: string;
  deletedBy: string;
}

// CUENTAS
interface AccountCreatedEvent {
  type: "AccountCreated";
  accountId: string;
  userId: string;
  initialBalance: { value: string; currency: string };
}

interface AccountBalanceChangedEvent {
  type: "AccountBalanceChanged";
  accountId: string;
  userId: string;
  previousBalance: { value: string; currency: string };
  newBalance: { value: string; currency: string };
  reason:
    | "TRANSACTION_CREATED"
    | "TRANSACTION_DELETED"
    | "TRANSACTION_AMOUNT_CHANGED";
}

interface AccountArchivedEvent {
  type: "AccountArchived";
  accountId: string;
  userId: string;
  finalBalance: { value: string; currency: string };
}

// CATEGORÍAS
interface CategoryDeletedEvent {
  type: "CategoryDeleted";
  categoryId: string;
  userId: string;
  deletedSubcategoryIds: string[]; // IDs de subcategorías eliminadas en cascada
}

// PRESUPUESTOS
interface BudgetThresholdReachedEvent {
  type: "BudgetThresholdReached";
  budgetId: string;
  userId: string;
  categoryId: string;
  threshold: number; // porcentaje alcanzado
  executedAmount: { value: string; currency: string };
  budgetAmount: { value: string; currency: string };
}

interface BudgetExceededEvent {
  type: "BudgetExceeded";
  budgetId: string;
  userId: string;
  categoryId: string;
  executedAmount: { value: string; currency: string };
  budgetAmount: { value: string; currency: string };
  excessAmount: { value: string; currency: string };
}

// METAS
interface GoalProgressUpdatedEvent {
  type: "GoalProgressUpdated";
  goalId: string;
  userId: string;
  previousAmount: { value: string; currency: string };
  currentAmount: { value: string; currency: string };
  targetAmount: { value: string; currency: string };
  progressPercentage: number;
}

interface GoalCompletedEvent {
  type: "GoalCompleted";
  goalId: string;
  userId: string;
  targetAmount: { value: string; currency: string };
  completedAt: string;
}
```

### Matriz de handlers

Cada evento tiene uno o más handlers. Los handlers nunca modifican el agregado que publicó el evento.

| Evento                       | Handler                        | Módulo handler | Acción                                                                                                                      |
| ---------------------------- | ------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `TransactionCreated`         | `UpdateAccountBalanceHandler`  | `accounts`     | `account.applyBalanceDelta(BalanceDelta.increase(amount))`                                                                  |
| `TransactionCreated`         | `UpdateBudgetExecutionHandler` | `budgets`      | `budget.applyTransactionDelta(BalanceDelta.increase(amount))`                                                               |
| `TransactionCreated`         | `TrackUserActionHandler`       | `analytics`    | Registra `transaction.created`                                                                                              |
| `TransactionAmountChanged`   | `UpdateAccountBalanceHandler`  | `accounts`     | `account.applyBalanceDelta(delta)` donde `delta = BalanceDelta` calculado desde la diferencia                               |
| `TransactionAmountChanged`   | `UpdateBudgetExecutionHandler` | `budgets`      | `budget.applyTransactionDelta(delta)`                                                                                       |
| `TransactionDateChanged`     | `UpdateBudgetExecutionHandler` | `budgets`      | `budget.applyTransactionDelta(BalanceDelta.decrease(amount))` en período anterior; `BalanceDelta.increase(amount)` en nuevo |
| `TransactionCategoryChanged` | `UpdateBudgetExecutionHandler` | `budgets`      | `BalanceDelta.decrease(amount)` en categoría anterior; `BalanceDelta.increase(amount)` en nueva                             |
| `TransactionDeleted`         | `UpdateAccountBalanceHandler`  | `accounts`     | `account.applyBalanceDelta(BalanceDelta.decrease(amount))`                                                                  |
| `TransactionDeleted`         | `UpdateBudgetExecutionHandler` | `budgets`      | `budget.applyTransactionDelta(BalanceDelta.decrease(amount))`                                                               |
| `CategoryDeleted`            | `DeactivateBudgetsHandler`     | `budgets`      | Budgets afectados → `INACTIVE`                                                                                              |
| `BudgetThresholdReached`     | `NotifyUserHandler`            | `analytics`    | Registra alerta                                                                                                             |
| `BudgetExceeded`             | `NotifyUserHandler`            | `analytics`    | Registra alerta                                                                                                             |
| `GoalCompleted`              | `TrackUserActionHandler`       | `analytics`    | Registra logro                                                                                                              |

---

## 7. Interfaces de Repositorios

Los repositorios definen **qué** se puede hacer, no **cómo**. La implementación (Prisma) vive en la capa de infraestructura.

### 7.0 IRepository<T> — Contrato base

Todos los repositorios especializados extienden este contrato. Garantiza uniformidad y permite Mock genérico en tests.

```typescript
// packages/shared/src/domain/repository.interface.ts

interface IRepository<T, ID> {
  findById(id: ID, userId: UserId): Promise<T | null>;
  save(entity: T): Promise<void>;
  exists(id: ID, userId: UserId): Promise<boolean>;
  softDelete(id: ID, userId: UserId, deletedBy: UserId): Promise<void>;
}

// Uso:
// interface ITransactionRepository extends IRepository<Transaction, TransactionId> { ... }
// interface IAccountRepository extends IRepository<Account, AccountId> { ... }
```

**Por qué un contrato base**: Permite construir un `MockRepository<T>` genérico para tests unitarios. Los repositorios concretos heredan las operaciones comunes y solo definen las específicas de su entidad.

---

### 7.1 ITransactionRepository

```typescript
interface ITransactionRepository extends IRepository<
  Transaction,
  TransactionId
> {
  // Métodos heredados de IRepository<Transaction, TransactionId>:
  // findById, save, exists, softDelete

  // Métodos especializados:
  findAll(
    userId: UserId,
    filters: TransactionFilters,
  ): Promise<PaginatedResult<Transaction>>;
  findByTransferPairId(
    pairId: TransferId,
    userId: UserId,
  ): Promise<Transaction[]>;
  findByAccountId(
    accountId: AccountId,
    userId: UserId,
    dateRange?: DateRange,
  ): Promise<Transaction[]>;
  countByCategoryIncludingDeleted(
    categoryId: CategoryId,
    userId: UserId,
  ): Promise<number>;
  // incluye soft-deleted en el conteo (para CAT-R04)
  saveMany(transactions: Transaction[]): Promise<void>; // para TransferPair
}

interface TransactionFilters {
  accountId?: AccountId;
  categoryId?: CategoryId;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // full-text search sobre description y notes
  tags?: string[];
  page: number;
  pageSize: number;
  sortBy: "date" | "amount" | "created_at";
  sortOrder: "asc" | "desc";
}
```

---

### 7.2 IAccountRepository

```typescript
interface IAccountRepository extends IRepository<Account, AccountId> {
  findAllByUser(userId: UserId): Promise<Account[]>;
  findActiveByUser(userId: UserId): Promise<Account[]>;
  // save() hereda de IRepository<Account>
  // Nota: save() persiste currentBalance solo cuando viene de applyBalanceDelta()
  // La capa de aplicación no puede manipular el balance directamente
}
```

---

### 7.3 ICategoryRepository

```typescript
interface ICategoryRepository extends IRepository<Category, CategoryId> {
  findAllByUser(userId: UserId): Promise<Category[]>;
  findSubcategories(parentId: CategoryId, userId: UserId): Promise<Category[]>;
  findSystemCategories(): Promise<Category[]>;
  hasTransactionsIncludingDeleted(
    categoryId: CategoryId,
    userId: UserId,
  ): Promise<boolean>;
  saveMany(categories: Category[]): Promise<void>; // para eliminación en cascada
}
```

---

### 7.4 IBudgetRepository

```typescript
export const BUDGET_REPOSITORY = Symbol("BUDGET_REPOSITORY");

interface IBudgetRepository extends IRepository<Budget, string> {
  // Hereda: findById, save, exists
  // NOTA: softDelete() heredado de IRepository NO aplica a Budget.
  // Budget no tiene deleted_at. El ciclo de vida se gestiona via budget.deactivate()
  // o budget.expire() seguidos de save(). Llamar a softDelete() en Budget es un error.

  findAllByUser(userId: string): Promise<Budget[]>;
  // Incluye ACTIVE, EXPIRED, INACTIVE.

  findActiveByUser(userId: string): Promise<Budget[]>;
  // Solo status = ACTIVE.

  findByCategory(categoryId: string, userId: string): Promise<Budget[]>;

  findActiveByCategoryAndDate(
    categoryId: string,
    userId: string,
    date: Date,
  ): Promise<Budget | null>;
  // Busca budget ACTIVE donde startDate <= date <= endDate.
  // Query más frecuente — ocurre en cada transacción EXPENSE.

  existsActiveBudget(
    userId: string,
    categoryId: string,
    period: BudgetPeriod,
    startDate: Date,
  ): Promise<boolean>;
  // Para validar BGT-R01 antes de crear Y antes de reactivar.
  // El Use Case ReactivateBudget llama a este método antes de budget.reactivate().
}
```

---

### 7.5 IGoalRepository

```typescript
interface IGoalRepository extends IRepository<Goal, GoalId> {
  findAllByUser(userId: UserId): Promise<Goal[]>;
  findActiveByUser(userId: UserId): Promise<Goal[]>;
}
```

---

## 8. Domain Services

Los Domain Services contienen lógica que pertenece al dominio pero no encaja naturalmente en una única entidad.

### 8.1 TransferService

```typescript
// modules/transactions/domain/services/transfer.service.ts

// TransferPair representa la transferencia como unidad conceptual,
// aunque internamente sean dos Transaction independientes.
interface TransferPair {
  readonly pairId: TransferId; // UUID compartido por las dos transacciones
  readonly source: Transaction; // EXPENSE en la cuenta origen
  readonly destination: Transaction; // INCOME en la cuenta destino
}

class TransferService {
  // Crea el par de transacciones y verifica G-03 (conservación del dinero)
  createTransfer(props: CreateTransferProps): TransferPair;
  // Retorna TransferPair. El Use Case persiste source y destination
  // en una transacción atómica de DB. (TRF-R01, TRF-R02, TRF-R03)
  //
  // Por qué TransferPair y no [Transaction, Transaction]:
  // Semánticamente, la transferencia ES una unidad. Internamente son dos
  // transacciones, pero el dominio no debe exponer ese detalle como una tupla sin nombre.
  // TransferPair nombra la relación y hace el código autodocumentado.
}
```

---

### 8.2 BudgetRecalculationService

```typescript
// modules/budgets/domain/services/budget-recalculation.service.ts

class BudgetRecalculationService {
  // Calcula qué presupuestos deben ajustarse cuando una transacción EXPENSE
  // cambia de fecha cruzando un límite de período (BGT-R04).
  calculateDateChangeDelta(
    previousDate: Date,
    newDate: Date,
    amount: Money,
    budgetForPreviousPeriod: Budget | null,
    budgetForNewPeriod: Budget | null,
  ): {
    deductFrom: Budget | null; // pierde executed_amount
    addTo: Budget | null; // gana executed_amount
  };
  // Si ambas fechas caen en el mismo presupuesto → { deductFrom: null, addTo: null }
  // Si el presupuesto no existe para uno de los períodos → null para ese lado.
}
```

---

### 8.3 BalanceReconciliationService

```typescript
// modules/accounts/domain/services/balance-reconciliation.service.ts

class BalanceReconciliationService {
  // Recalcula el balance real desde las transacciones
  // Usado por el job nocturno de reconciliación
  calculateRealBalance(
    initialBalance: Money,
    transactions: Transaction[],
  ): Money;
  // G-05: el balance siempre puede reconstruirse
}
```

---

## 8. Invariantes implementadas — Trazabilidad

Mapa completo: Business Rule → implementación técnica.

| Regla                                   | Dónde se implementa                          | Cómo                                                                    |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| G-01 (el dinero no desaparece)          | `TransferService`, handlers de Domain Events | Operación atómica, delta suma cero en transferencia                     |
| G-07 (balance nunca editable)           | `Account`                                    | No hay setter público para `currentBalance`. Solo `applyBalanceDelta()` |
| TRX-R01 (monto positivo)                | `Money.of()`                                 | Lanza `DomainException(TRX_003)` si `value <= 0`                        |
| TRX-R02 (fecha del movimiento)          | `ITransactionRepository.findAll()`           | Filters usan `date`, no `created_at`                                    |
| TRX-R03 (fecha futura máx 7 días)       | `TransactionDate.of()`                       | Validación en Value Object                                              |
| TRX-R04 (compatibilidad categoría-tipo) | `Transaction.create()`                       | `Category.isCompatibleWith()`                                           |
| TRX-R05 (tipo inmutable)                | `Transaction`                                | No hay método `updateType()`. El tipo es readonly                       |
| TRX-R06 (editar monto = recalculo)      | `UpdateAccountBalanceHandler`                | Reacciona a `TransactionAmountChanged`                                  |
| TRX-R07 (fecha cruza período)           | `BudgetRecalculationService`                 | Reacciona a `TransactionDateChanged`                                    |
| TRX-R09 (soft delete)                   | `ITransactionRepository.softDelete()`        | Solo actualiza `deleted_at`, nunca `DELETE`                             |
| ACC-R02 (balance inicial inmutable)     | `Account.updateInitialBalance()`             | Verifica `_transactionCount > 0`                                        |
| ACC-R03 (balance no editable)           | `Account`, DTOs                              | `currentBalance` ausente de todos los DTOs de edición                   |
| CAT-R01 (máx 2 niveles)                 | `ICategoryRepository.findById()`             | `Category.createSubcategory()` valida que el padre no tenga `parentId`  |
| CAT-R02 (subcategoría hereda tipo)      | `Category.createSubcategory()`               | Fuerza `type = parent.type`                                             |
| CAT-R03 (categorías del sistema)        | `Category.softDelete()`                      | Lanza `DomainException(CAT_002)` si `isSystem`                          |
| CAT-R04 (categoría con transacciones)   | Use Case `DeleteCategory`                    | Consulta `ICategoryRepository.hasTransactionsIncludingDeleted()`        |
| BGT-R01 (unicidad de presupuesto)       | Use Case `CreateBudget`                      | Consulta `IBudgetRepository.existsActiveBudget()`                       |
| BGT-R07 (presupuesto no bloquea)        | Use Case `CreateTransaction`                 | Nunca consulta presupuestos antes de crear                              |
| GOL-R03 (current <= target)             | `Goal.addProgress()`                         | Limita y completa si se supera                                          |
| GOL-R04 (meta completada inmutable)     | `Goal.assertNotCompleted()`                  | Llamado en cada mutación                                                |
| GOL-R05 (PAUSED no → COMPLETED)         | `Goal.activate()`                            | Verifica `status === PAUSED` antes de permitir                          |

---

> [!NOTE]
> **Próximo documento**: `04-erd.md`
> El ERD es la traducción de este Domain Model a la estructura de base de datos. Cada entidad del dominio tiene su tabla correspondiente. Los Value Objects se mapean a columnas (Money → amount + currency). Los Domain Events no se persisten en MVP (solo se emiten en proceso).

---

_Documento 03 de 07 — MyMoney Domain Model v1.2 — Julio 2026_
