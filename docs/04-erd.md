# MyMoney — ERD (Entity Relationship Design)

> **Documento**: 04 de 07
> **Versión**: 1.1.0 — Julio 2026
> **Estado**: APROBADO — congelado
> **Dependencias**: `03-domain-model.md` (v1.2)
> **Siguiente documento**: `05-api-contracts.md`

---

> [!IMPORTANT]
> Este documento es la traducción del Domain Model al modelo relacional. Toda decisión de esquema deriva de una entidad, un Value Object o una regla del Domain Model. Ninguna tabla o columna existe sin una justificación en los documentos anteriores.
>
> El `schema.prisma` será una traducción casi mecánica de este documento.

---

## Índice

1. [Objetivos y principios](#1-objetivos-y-principios)
2. [Convenciones de nombres](#2-convenciones-de-nombres)
3. [Tablas principales — derivadas de los agregados](#3-tablas-principales--derivadas-de-los-agregados)
4. [Tablas de soporte](#4-tablas-de-soporte)
5. [Relaciones y cardinalidades](#5-relaciones-y-cardinalidades)
6. [Constraints](#6-constraints)
7. [Índices](#7-índices)
8. [Estrategia de auditoría y soft delete](#8-estrategia-de-auditoría-y-soft-delete)
9. [Mapeo Value Object → columnas](#9-mapeo-value-object--columnas)
10. [Matriz Entidad del dominio → Tabla SQL](#10-matriz-entidad-del-dominio--tabla-sql)

---

## 1. Objetivos y principios

### 1.1 Qué debe cumplir este modelo relacional

1. **Fidelidad al dominio**: Cada tabla corresponde a un agregado o entidad del Domain Model. No se crean tablas por conveniencia técnica.
2. **Auditabilidad completa**: Toda modificación deja traza. El historial es inmutable.
3. **Reconstrucción de balances**: Dado el historial de `transactions` y el `initial_balance` de una `account`, el `current_balance` debe ser reconstruible (Invariante G-05).
4. **Aislamiento por usuario**: Ningún dato financiero puede consultarse sin `user_id`. Enforced a nivel de aplicación; reforzado con índices compuestos que incluyen `user_id`.
5. **Soft delete universal**: Ninguna entidad financiera se elimina físicamente. `deleted_at IS NULL` es el discriminador de "activo".
6. **Preparado para escala**: Los índices están diseñados para las queries reales de la aplicación, no para queries genéricas.

### 1.2 Lo que este modelo NO hace

- No implementa row-level security de PostgreSQL (RLS) en el MVP. El aislamiento es en la capa de aplicación.
- No usa tablas de eventos (Event Sourcing). Los Domain Events son en proceso, no persistidos.
- No normaliza a 3NF a ultranza cuando desnormalizar tiene un beneficio claro de rendimiento (ej: `user_id` en `transactions` aunque se pueda derivar de `accounts`).

---

## 2. Convenciones de nombres

### 2.1 Tablas

```
snake_case, plural, sustantivos.

✅  users, accounts, transactions, categories, budgets, goals
✅  audit_logs, feature_flags, user_settings, balance_projections
❌  User, tblTransactions, transaction_table
```

### 2.2 Columnas

```
snake_case, singular descriptivo.

PKs:         id          → UUID, siempre
FKs:         {tabla_singular}_id  → user_id, account_id, category_id
Booleanos:   is_{adjetivo}        → is_system, is_active, is_verified
Fechas:      {evento}_at          → created_at, updated_at, deleted_at
Enum text:   {campo}              → type, status, period, role
```

### 2.3 Tipos de datos

| Concepto          | Tipo PostgreSQL  | Razón                                                  |
| ----------------- | ---------------- | ------------------------------------------------------ |
| Identificadores   | `UUID`           | Evita IDs secuenciales predecibles                     |
| Montos monetarios | `DECIMAL(15,4)`  | Precisión financiera. 15 dígitos totales, 4 decimales  |
| Monedas           | `CHAR(3)`        | ISO 4217 siempre tiene 3 caracteres                    |
| Textos cortos     | `VARCHAR(n)`     | Límite explícito por columna                           |
| Textos largos     | `TEXT`           | Sin límite fijo                                        |
| Fechas con zona   | `TIMESTAMPTZ`    | Siempre UTC en base de datos                           |
| Fechas sin hora   | `DATE`           | Para `transactions.date` — la fecha del movimiento     |
| Booleanos         | `BOOLEAN`        | Sin sustitutos (0/1, 'Y'/'N')                          |
| Datos extensibles | `JSONB`          | Metadata, reglas de recurrencia, configuraciones       |
| Enums             | `TEXT` con CHECK | Más flexible que `ENUM` de PostgreSQL para migraciones |

> [!NOTE]
> Se usa `TEXT` con `CHECK (column IN ('A','B','C'))` en lugar de `CREATE TYPE ENUM` de PostgreSQL. Razón: agregar un valor a un ENUM nativo requiere un `ALTER TYPE` que puede bloquear tablas. Con `TEXT + CHECK`, se modifica solo el constraint.

### 2.4 Timestamps estándar (todos en UTC)

Todas las tablas con datos mutables incluyen:

```sql
created_at  TIMESTAMPTZ  NOT NULL  DEFAULT NOW()
updated_at  TIMESTAMPTZ  NOT NULL  DEFAULT NOW()
```

Las tablas con auditoría completa también incluyen:

```sql
created_by  UUID  REFERENCES users(id)  -- NULL = sistema/seed/automático
updated_by  UUID  REFERENCES users(id)
deleted_at  TIMESTAMPTZ  -- NULL = activo
deleted_by  UUID  REFERENCES users(id)
```

---

## 3. Tablas principales — derivadas de los agregados

### 3.1 `users`

```sql
CREATE TABLE users (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255)  NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  name            VARCHAR(100)  NOT NULL,
  avatar_url      VARCHAR(500),
  role            TEXT          NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  email_verified  BOOLEAN       NOT NULL DEFAULT false,
  -- auditoría
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID          REFERENCES users(id)
);
```

**Notas**:

- `created_by`/`updated_by` no aplican a `users` — el usuario se crea a sí mismo.
- `deleted_by` es un auto-ref (administrador que desactiva la cuenta).

---

### 3.2 `accounts`

```sql
CREATE TABLE accounts (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id),
  name             VARCHAR(100)  NOT NULL,
  type             TEXT          NOT NULL
                   CHECK (type IN ('CHECKING','SAVINGS','CASH','CREDIT','INVESTMENT')),
  currency         CHAR(3)       NOT NULL,   -- ISO 4217
  initial_balance  DECIMAL(15,4) NOT NULL DEFAULT 0,
  current_balance  DECIMAL(15,4) NOT NULL DEFAULT 0,
  -- current_balance NUNCA se actualiza directamente (Invariante G-07, ACC-R03)
  -- Solo se modifica via handler de Domain Event TransactionCreated/Deleted/AmountChanged
  color            CHAR(7),       -- hex color, ej: '#3B82F6'
  icon             VARCHAR(50),
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  -- auditoría completa
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by       UUID          REFERENCES users(id),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by       UUID          REFERENCES users(id),
  deleted_at       TIMESTAMPTZ,
  deleted_by       UUID          REFERENCES users(id)
);
```

**Invariante ACC-R03**: El campo `current_balance` no está presente en ningún DTO de edición del backend. Es de facto write-protected a nivel aplicación.

---

### 3.3 `categories`

```sql
CREATE TABLE categories (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          REFERENCES users(id),
  -- NULL = categoría del sistema (is_system = true)
  parent_id   UUID          REFERENCES categories(id),
  -- NULL = categoría raíz. CAT-R01: solo 1 nivel de anidamiento.
  name        VARCHAR(100)  NOT NULL,
  type        TEXT          NOT NULL
              CHECK (type IN ('INCOME','EXPENSE','BOTH')),
  icon        VARCHAR(50),
  color       CHAR(7),
  is_system   BOOLEAN       NOT NULL DEFAULT false,
  -- auditoría
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by  UUID          REFERENCES users(id),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by  UUID          REFERENCES users(id),
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID          REFERENCES users(id)
);
```

**Invariante CAT-R01** (máximo 2 niveles): No hay constraint a nivel DB para esto — se valida en la entidad `Category.createSubcategory()` verificando que el padre tenga `parent_id IS NULL`.

---

### 3.4 `transactions`

```sql
CREATE TABLE transactions (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES users(id),
  -- Desnormalización deliberada: evita JOIN con accounts en queries frecuentes
  account_id        UUID          NOT NULL REFERENCES accounts(id),
  category_id       UUID          REFERENCES categories(id),
  type              TEXT          NOT NULL
                    CHECK (type IN ('INCOME','EXPENSE','TRANSFER')),
  amount            DECIMAL(15,4) NOT NULL
                    CHECK (amount > 0),
  -- amount SIEMPRE > 0 (TRX-R01). El tipo determina el efecto en el balance.
  currency          CHAR(3)       NOT NULL,   -- ISO 4217 — parte del Value Object Money
  description       VARCHAR(500),
  notes             TEXT,
  date              DATE          NOT NULL,
  -- La fecha del MOVIMIENTO, no de registro (TRX-R02). Reports filtran por este campo.
  transfer_pair_id  UUID,
  -- Vincula los dos lados de una TransferPair (TRF-R01)
  is_recurring      BOOLEAN       NOT NULL DEFAULT false,
  recurring_rule    JSONB,
  -- iCal RRULE en JSONB. NULL si is_recurring = false.
  metadata          JSONB         NOT NULL DEFAULT '{}',
  -- Campo de extensión para IA, OCR, importaciones. Nunca modifica el schema.
  -- auditoría completa
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by        UUID          REFERENCES users(id),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by        UUID          REFERENCES users(id),
  deleted_at        TIMESTAMPTZ,
  deleted_by        UUID          REFERENCES users(id)
);
```

**Notas**:

- `user_id` está desnormalizado (se puede derivar desde `accounts.user_id`). Justificación: el 100% de los queries de transacciones filtran por `user_id`. Tener la columna evita un JOIN obligatorio en cada query.
- `transfer_pair_id` no es FK a ninguna tabla — es un UUID compartido entre los dos registros del par.

---

### 3.5 `budgets`

```sql
CREATE TABLE budgets (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id),
  category_id      UUID          NOT NULL REFERENCES categories(id),
  period           TEXT          NOT NULL
                   CHECK (period IN ('MONTHLY','WEEKLY','YEARLY')),
  amount           DECIMAL(15,4) NOT NULL
                   CHECK (amount > 0),
  currency         CHAR(3)       NOT NULL,
  alert_threshold  INTEGER       NOT NULL DEFAULT 80
                   CHECK (alert_threshold BETWEEN 1 AND 100),
  executed_amount  DECIMAL(15,4) NOT NULL DEFAULT 0,
  -- Actualizado EXCLUSIVAMENTE por handlers de Domain Events.
  -- NUNCA via UPDATE directo, DTO ni endpoint de la API.
  status           TEXT          NOT NULL DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE','EXPIRED','INACTIVE')),
  start_date       DATE          NOT NULL,
  end_date         DATE          NOT NULL,
  -- end_date es calculado por el backend (Budget.create()) a partir de period + start_date.
  -- El cliente NUNCA lo envía. Es inmutable después de la creación.
  --   WEEKLY:  start_date + 6 días
  --   MONTHLY: último día del mes de start_date
  --   YEARLY:  31 de diciembre del año de start_date
  -- auditoría estándar (sin soft-delete — Budget no usa deleted_at)
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by       UUID          REFERENCES users(id),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by       UUID          REFERENCES users(id)
  -- NO tiene deleted_at ni deleted_by.
  -- El ciclo de vida se gestiona únicamente con status (ACTIVE/EXPIRED/INACTIVE).
  -- Ver máquina de estado §8.3 de business-rules.md.
);
```

---

### 3.6 `goals`

```sql
CREATE TABLE goals (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id),
  name            VARCHAR(200)  NOT NULL,
  target_amount   DECIMAL(15,4) NOT NULL
                  CHECK (target_amount > 0),
  current_amount  DECIMAL(15,4) NOT NULL DEFAULT 0
                  CHECK (current_amount >= 0),
  currency        CHAR(3)       NOT NULL,
  target_date     DATE,
  -- NULL = meta sin fecha límite (GOL-R02)
  status          TEXT          NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE','PAUSED','COMPLETED')),
  -- auditoría completa
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by      UUID          REFERENCES users(id),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by      UUID          REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID          REFERENCES users(id)
);
```

**CHECK constraint de dominio**: `current_amount <= target_amount` no se puede expresar limpiamente como CHECK sin un trigger, ya que el límite es dinámico. Se implementa en la entidad `Goal.addProgress()` (GOL-R03).

---

## 4. Tablas de soporte

### 4.1 `tags`

```sql
CREATE TABLE tags (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id),
  name        VARCHAR(50)   NOT NULL,
  color       CHAR(7),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

### 4.2 `transaction_tags` (tabla de unión N:M)

```sql
CREATE TABLE transaction_tags (
  transaction_id  UUID  NOT NULL REFERENCES transactions(id),
  tag_id          UUID  NOT NULL REFERENCES tags(id),
  PRIMARY KEY (transaction_id, tag_id)
);
```

---

### 4.3 `attachments`

```sql
CREATE TABLE attachments (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID          NOT NULL REFERENCES transactions(id),
  user_id         UUID          NOT NULL REFERENCES users(id),
  file_name       VARCHAR(255)  NOT NULL,
  file_url        VARCHAR(1000) NOT NULL,  -- URL en storage (R2/S3/local)
  file_size       INTEGER       NOT NULL,  -- bytes
  mime_type       VARCHAR(100)  NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
```

---

### 4.4 `sessions`

```sql
CREATE TABLE sessions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id),
  token_hash  VARCHAR(255)  NOT NULL,
  -- Token hasheado. Nunca el token en claro.
  user_agent  TEXT,
  ip_address  INET,
  expires_at  TIMESTAMPTZ   NOT NULL,
  last_used_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  revoked_at  TIMESTAMPTZ   -- NULL = sesión activa
);
```

---

### 4.5 `audit_logs`

```sql
CREATE TABLE audit_logs (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES users(id),
  entity_type   VARCHAR(50)   NOT NULL,  -- 'transaction', 'account', 'budget', etc.
  entity_id     UUID          NOT NULL,
  action        TEXT          NOT NULL
                CHECK (action IN ('CREATE','UPDATE','DELETE')),
  previous_data JSONB,        -- estado anterior (NULL en CREATE)
  new_data      JSONB,        -- estado nuevo (NULL en DELETE)
  request_id    VARCHAR(100),  -- X-Request-ID para correlación
  correlation_id VARCHAR(100), -- agrupa eventos de una operación (ej: TransferPair)
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  -- SIN deleted_at. Los audit_logs son INMUTABLES. (AR-01)
);
```

**Importante**: Esta tabla no tiene soft delete. Es el registro de integridad del sistema. Nada se borra de aquí.

---

### 4.6 `feature_flags`

```sql
CREATE TABLE feature_flags (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  key          VARCHAR(100)  NOT NULL UNIQUE,  -- 'feature.ocr', 'feature.ai'
  enabled      BOOLEAN       NOT NULL DEFAULT false,
  description  TEXT,
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by   UUID          REFERENCES users(id)
  -- Sin user_id FK — los flags son globales, no por usuario
);
```

**Valores iniciales (seed)**:

| key                         | enabled |
| --------------------------- | ------- |
| `feature.ocr`               | false   |
| `feature.ai_classification` | false   |
| `feature.offline_sync`      | false   |
| `feature.excel_import`      | false   |
| `feature.pdf_export`        | false   |
| `feature.public_api`        | false   |
| `feature.budget_alerts`     | true    |

---

### 4.7 `user_settings`

```sql
CREATE TABLE user_settings (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL UNIQUE REFERENCES users(id),
  default_currency  CHAR(3)       NOT NULL DEFAULT 'USD',
  locale            VARCHAR(10)   NOT NULL DEFAULT 'en-US',
  timezone          VARCHAR(50)   NOT NULL DEFAULT 'UTC',
  theme             TEXT          NOT NULL DEFAULT 'system'
                    CHECK (theme IN ('light','dark','system')),
  date_format       VARCHAR(20)   NOT NULL DEFAULT 'MM/DD/YYYY',
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 4.8 `balance_projections`

> Implementa **BalanceProjection** (Event Sourcing Lite) definido en la arquitectura.

```sql
CREATE TABLE balance_projections (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID          NOT NULL REFERENCES accounts(id),
  calculated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  balance           DECIMAL(15,4) NOT NULL,
  transaction_count INTEGER       NOT NULL,
  -- Cuántas transacciones se incluyeron en este snapshot
  checksum          VARCHAR(64)   NOT NULL
  -- SHA-256 del conjunto de transacciones incluidas.
  -- Permite detectar inconsistencias sin recalcular todo.
);
```

**Propósito**: Auditoría financiera y reconciliación. El job nocturno crea un snapshot diario y compara `balance` con `accounts.current_balance`. Si difieren, genera alerta.

---

### 4.9 `user_actions` (analytics interno)

```sql
CREATE TABLE user_actions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id),
  action      VARCHAR(100)  NOT NULL,  -- 'transaction.created', 'budget.exceeded', etc.
  entity_type VARCHAR(50),
  entity_id   UUID,
  metadata    JSONB         NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  -- Sin auditoría adicional. Es append-only.
);
```

---

## 5. Relaciones y cardinalidades

```
users ─────────────────────────────────────────────────────────────
  │  1:1 → user_settings
  │  1:N → accounts
  │  1:N → categories        (solo categorías no-sistema tienen user_id)
  │  1:N → transactions
  │  1:N → budgets
  │  1:N → goals
  │  1:N → tags
  │  1:N → audit_logs
  │  1:N → user_actions
  │  1:N → sessions
  └──────────────────────────────────────────────────────────────────

accounts
  │  N:1 → users
  │  1:N → transactions
  │  1:N → balance_projections
  └──────────────────────────────────────────────────────────────────

transactions
  │  N:1 → users          (desnormalizado)
  │  N:1 → accounts
  │  N:1 → categories     (nullable)
  │  N:M → tags           (via transaction_tags)
  │  1:N → attachments
  │  self-ref: transfer_pair_id vincula dos transactions
  └──────────────────────────────────────────────────────────────────

categories
  │  N:1 → users          (nullable para is_system)
  │  N:1 → categories     (self-ref: parent_id, máx 2 niveles)
  │  1:N → transactions
  │  1:N → budgets
  └──────────────────────────────────────────────────────────────────

budgets
  │  N:1 → users
  │  N:1 → categories
  └──────────────────────────────────────────────────────────────────

goals
  │  N:1 → users
  └──────────────────────────────────────────────────────────────────
```

---

## 6. Constraints

### 6.1 UNIQUE constraints

```sql
-- Un email solo puede pertenecer a un usuario activo
CREATE UNIQUE INDEX uq_users_email
  ON users(email)
  WHERE deleted_at IS NULL;

-- Un usuario no puede tener dos cuentas activas con el mismo nombre
CREATE UNIQUE INDEX uq_accounts_user_name
  ON accounts(user_id, name)
  WHERE deleted_at IS NULL;

-- BGT-R01: Un solo presupuesto activo por (usuario, categoría, período, fecha inicio)
-- Budget no usa deleted_at — el filtro parcial es solo sobre status.
CREATE UNIQUE INDEX uq_budgets_active
  ON budgets(user_id, category_id, period, start_date)
  WHERE status = 'ACTIVE';

-- feature_flags: key es único globalmente
-- (ya declarado como UNIQUE en la columna)

-- user_settings: un usuario, una configuración
-- (ya declarado como UNIQUE en la columna)
```

### 6.2 CHECK constraints (además de los ya declarados en las tablas)

```sql
-- Coherencia de transferencias: si transfer_pair_id no es NULL, el tipo debe ser TRANSFER
-- No implementable como CHECK simple (requiere consulta de otra fila)
-- → Validado en la entidad TransferService / Use Case

-- Coherencia de fecha: start_date <= end_date en budgets
ALTER TABLE budgets
  ADD CONSTRAINT ck_budgets_date_range
  CHECK (end_date IS NULL OR start_date <= end_date);

-- Goals: target_date en el futuro al crear (no expresable como CHECK estático)
-- → Validado en la entidad Goal.create()
```

### 6.3 FOREIGN KEY constraints

Todas las FKs usan `ON DELETE RESTRICT` por defecto:

```sql
-- No se puede eliminar un usuario con cuentas, transacciones, etc.
-- (Las eliminaciones son soft delete — esto es una red de seguridad para borrados físicos accidentales)
```

**Excepción**: Las FKs de `created_by`, `updated_by`, `deleted_by` son `ON DELETE SET NULL` para evitar que borrar un usuario de sistema rompa el historial.

---

## 7. Índices

Los índices se diseñan para las queries reales de la aplicación. Cada índice tiene una justificación.

### 7.1 Índices en `transactions` (tabla más consultada)

```sql
-- Query principal del dashboard: todas las transacciones del usuario, ordenadas por fecha
CREATE INDEX idx_transactions_user_date
  ON transactions(user_id, date DESC)
  WHERE deleted_at IS NULL;

-- Filtro por cuenta (para la vista de detalle de cuenta)
CREATE INDEX idx_transactions_account_date
  ON transactions(account_id, date DESC)
  WHERE deleted_at IS NULL;

-- Filtro por categoría (para reportes y presupuestos)
CREATE INDEX idx_transactions_category_date
  ON transactions(category_id, date DESC)
  WHERE deleted_at IS NULL;

-- Búsqueda de pares de transferencia
CREATE INDEX idx_transactions_transfer_pair
  ON transactions(transfer_pair_id)
  WHERE transfer_pair_id IS NOT NULL;

-- Full-text search sobre description y notes (PostgreSQL)
CREATE INDEX idx_transactions_search
  ON transactions USING gin(
    to_tsvector('spanish', COALESCE(description,'') || ' ' || COALESCE(notes,''))
  )
  WHERE deleted_at IS NULL;
```

### 7.2 Índices en `accounts`

```sql
-- Cuentas activas del usuario (carga del dashboard)
CREATE INDEX idx_accounts_user_active
  ON accounts(user_id)
  WHERE deleted_at IS NULL;
```

### 7.3 Índices en `categories`

```sql
-- Categorías del usuario (incluyendo sistema)
CREATE INDEX idx_categories_user
  ON categories(user_id)
  WHERE deleted_at IS NULL;

-- Subcategorías de una categoría padre
CREATE INDEX idx_categories_parent
  ON categories(parent_id)
  WHERE parent_id IS NOT NULL AND deleted_at IS NULL;
```

### 7.4 Índices en `budgets`

```sql
-- Presupuestos del usuario (todos los estados)
CREATE INDEX idx_budgets_user
  ON budgets(user_id, status);

-- Presupuestos activos del usuario (carga del dashboard)
CREATE INDEX idx_budgets_user_active
  ON budgets(user_id)
  WHERE status = 'ACTIVE';

-- Presupuesto activo de una categoría para una fecha dada
-- (usado por el handler UpdateBudgetExecutionHandler en cada transacción EXPENSE)
CREATE INDEX idx_budgets_category_period
  ON budgets(category_id, start_date, end_date)
  WHERE status = 'ACTIVE';
```

### 7.5 Índices en `sessions`

```sql
-- Validación de sesión por token hash (ocurre en cada request)
CREATE INDEX idx_sessions_token
  ON sessions(token_hash)
  WHERE revoked_at IS NULL;

-- Sesiones activas del usuario
CREATE INDEX idx_sessions_user_active
  ON sessions(user_id)
  WHERE revoked_at IS NULL;
```

### 7.6 Índices en `audit_logs`

```sql
-- Historial de cambios de una entidad específica
CREATE INDEX idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id);

-- Historial de acciones del usuario
CREATE INDEX idx_audit_logs_user
  ON audit_logs(user_id, created_at DESC);

-- Correlación de operaciones complejas
CREATE INDEX idx_audit_logs_correlation
  ON audit_logs(correlation_id)
  WHERE correlation_id IS NOT NULL;
```

---

## 8. Estrategia de auditoría y soft delete

### 8.1 Soft delete — patrón universal

```sql
-- Patrón universal aplicado a todas las entidades financieras EXCEPTO budgets:
-- deleted_at IS NULL  → registro activo
-- deleted_at NOT NULL → registro eliminado (oculto al usuario, accesible en historial)

-- Todos los índices de datos activos incluyen WHERE deleted_at IS NULL
-- Todos los queries de listado incluyen WHERE deleted_at IS NULL
-- Los DELETE físicos están prohibidos en el código de aplicación
```

**Excepción — `budgets`**: La tabla `budgets` NO tiene `deleted_at` ni `deleted_by`.
El ciclo de vida de un presupuesto se gestiona únicamente mediante la columna `status`:

| status     | Significado                                                                        |
| ---------- | ---------------------------------------------------------------------------------- |
| `ACTIVE`   | Presupuesto en uso. Acumula `executed_amount`.                                     |
| `EXPIRED`  | El `end_date` ha pasado. Solo lectura histórica.                                   |
| `INACTIVE` | Desactivado manualmente por el usuario o por `CategoryDeleted`. Puede reactivarse. |

No existe eliminación lógica de presupuestos. Un presupuesto `INACTIVE` que ya no se necesita simplemente permanece en ese estado. Esta decisión simplifica el modelo al eliminar un segundo mecanismo de ciclo de vida redundante con `status`.

### 8.2 Audit log — flujo

```
Cualquier write (CREATE / UPDATE / DELETE)
          │
          ▼
AuditInterceptor (NestJS)
          │
          ├─ Captura: entity_type, entity_id, action
          ├─ Captura: previous_data (estado antes)
          ├─ Captura: new_data (estado después)
          ├─ Inyecta: user_id desde sesión activa
          ├─ Inyecta: request_id desde header X-Request-ID
          └─ Inyecta: correlation_id desde contexto del request

          ▼
audit_logs INSERT
(en la misma transacción de DB que el write)
```

**Regla**: Si el insert en `audit_logs` falla, el write principal también hace rollback. La auditoría no es opcional.

### 8.3 Balance projections — flujo del job nocturno

```
Cron nocturno (3:00 AM UTC)
          │
          ▼
Para cada cuenta activa:
  1. Calcula balance_real = initial_balance + SUM(transactions)
  2. Calcula checksum del conjunto de transacciones incluidas
  3. Inserta en balance_projections
  4. Compara con accounts.current_balance
  5. Si |balance_real - current_balance| > 0.0001:
       → Inserta alerta en audit_logs con action = 'INCONSISTENCY_DETECTED'
```

---

## 9. Mapeo Value Object → columnas

Cada Value Object del Domain Model se persiste como columnas explícitas. Prisma no tiene concepto de Value Objects — la conversión ocurre en el repositorio.

| Value Object                         | Columna(s) en DB                             | Tabla(s)                                       | Notas                                                                                                                                    |
| ------------------------------------ | -------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Money { value, currency }`          | `amount DECIMAL(15,4)` + `currency CHAR(3)`  | `transactions`, `accounts`, `budgets`, `goals` | El VO se reconstruye en el repositorio                                                                                                   |
| `BalanceDelta { amount, direction }` | No persiste                                  | —                                              | Es efímero. Calculado en dominio, aplicado en handler                                                                                    |
| `TransactionType`                    | `type TEXT CHECK(...)`                       | `transactions`                                 | Enum como TEXT con CHECK                                                                                                                 |
| `AccountType`                        | `type TEXT CHECK(...)`                       | `accounts`                                     | Enum como TEXT con CHECK                                                                                                                 |
| `BudgetPeriod`                       | `period TEXT CHECK(...)`                     | `budgets`                                      | MONTHLY / WEEKLY / YEARLY                                                                                                                |
| `GoalStatus`                         | `status TEXT CHECK(...)`                     | `goals`                                        | ACTIVE / PAUSED / COMPLETED                                                                                                              |
| `BudgetStatus`                       | `status TEXT CHECK(...)`                     | `budgets`                                      | ACTIVE / EXPIRED / INACTIVE                                                                                                              |
| `TransactionDate`                    | `date DATE`                                  | `transactions`                                 | El VO añade la validación de 7 días; la columna solo almacena                                                                            |
| `startDate + endDate (Date, Date)`   | `start_date DATE` + `end_date DATE NOT NULL` | `budgets`                                      | `endDate` nunca es NULL — calculado por `Budget.create()`. Se persisten como columnas independientes (`Date` nativo, sin VO `DateRange`) |
| `Currency`                           | `currency CHAR(3)`                           | múltiples                                      | ISO 4217 almacenado directamente                                                                                                         |
| `TransferId` (pair)                  | `transfer_pair_id UUID`                      | `transactions`                                 | UUID compartido, sin FK a tabla propia                                                                                                   |

### 9.1 Reconstrucción de Money en el repositorio

```typescript
// Patrón de conversión en PrismaTransactionRepository

// DB → Domain (read)
private toDomain(raw: PrismaTransaction): Transaction {
  return Transaction.reconstitute({
    // ...otros campos
    amount: Money.of(raw.amount.toString(), raw.currency as Currency),
    // Prisma retorna Decimal para DECIMAL — convertir a string para Big.js
  })
}

// Domain → DB (write)
private toPersistence(entity: Transaction): PrismaTransactionCreateInput {
  return {
    // ...otros campos
    amount: entity.amount.value.toFixed(4),  // Big → string → Prisma Decimal
    currency: entity.amount.currency,
  }
}
```

---

## 10. Matriz Entidad del dominio → Tabla SQL

| Entidad / Agregado  | Tabla principal            | Tablas relacionadas               |
| ------------------- | -------------------------- | --------------------------------- |
| `User`              | `users`                    | `user_settings`, `sessions`       |
| `Account`           | `accounts`                 | `balance_projections`             |
| `Transaction`       | `transactions`             | `attachments`, `transaction_tags` |
| `TransferPair`      | `transactions` (dos filas) | vinculadas por `transfer_pair_id` |
| `Category`          | `categories`               | — (self-join para subcategorías)  |
| `Budget`            | `budgets`                  | —                                 |
| `Goal`              | `goals`                    | —                                 |
| `Tag`               | `tags`                     | `transaction_tags`                |
| `DomainEvent`       | **No persiste**            | Solo en proceso (EventEmitter2)   |
| `AuditLog`          | `audit_logs`               | —                                 |
| `FeatureFlag`       | `feature_flags`            | —                                 |
| `BalanceProjection` | `balance_projections`      | —                                 |
| `UserAction`        | `user_actions`             | —                                 |

---

> [!NOTE]
> **Próximo documento**: `05-api-contracts.md`
> Los contratos de API (OpenAPI) definen los endpoints y sus DTOs. Cada endpoint mapea a un Use Case del Domain Model. Los DTOs son un subconjunto de los campos de las entidades — nunca exponen campos internos ni de auditoría.

---

_Documento 04 de 07 — MyMoney ERD v1.1 — Julio 2026_
