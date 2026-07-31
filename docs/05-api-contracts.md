# MyMoney — API Contracts

> **Documento**: 05 de 07
> **Versión**: 1.1.0 — Julio 2026
> **Estado**: APROBADO — congelado
> **Dependencias**: `03-domain-model.md` (v1.2)
> **Siguiente documento**: `06-design-system.md`

---

> [!IMPORTANT]
> Este documento define los contratos RESTful de la aplicación.
>
> **Regla de oro**: La API NUNCA expone entidades de base de datos (`Prisma models`) ni Entidades del Dominio directamente. Siempre devuelve DTOs (Data Transfer Objects) diseñados específicamente para el consumo del frontend.
> Los campos de auditoría interna (`created_by`, `deleted_at`) nunca viajan al frontend.

---

## Índice

1. [Principios de Diseño de la API](#1-principios-de-diseño-de-la-api)
2. [Formatos Globales](#2-formatos-globales)
3. [Mapeo de Excepciones de Dominio a HTTP](#3-mapeo-de-excepciones-de-dominio-a-http)
4. [Endpoints: Auth & Sesiones](#4-endpoints-auth--sesiones)
5. [Endpoints: Cuentas (Accounts)](#5-endpoints-cuentas-accounts)
6. [Endpoints: Transacciones y Transferencias](#6-endpoints-transacciones-y-transferencias)
7. [Endpoints: Categorías](#7-endpoints-categorías)
8. [Endpoints: Presupuestos (Budgets)](#8-endpoints-presupuestos-budgets)
9. [Endpoints: Metas de Ahorro (Goals)](#9-endpoints-metas-de-ahorro-goals)

---

## 1. Principios de Diseño de la API

1. **RESTful Puro**: Usa los verbos HTTP correctamente (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
2. **Versionado por URL**: Todos los endpoints empiezan con `/api/v1/`.
3. **Paginación Estándar**: Todos los endpoints que devuelven listas (ej. transacciones) están paginados por offset/limit de forma predeterminada.
4. **Seguridad por Defecto**: A excepción de `/auth/login` y `/auth/register`, todos los endpoints requieren una sesión válida mediante una cookie `HttpOnly`.
5. **No fugas de información interna**: Los DTOs de respuesta nunca incluyen `deleted_at`, `created_by`, `updated_by` a menos que sea estrictamente necesario para la UI.
6. **Manejo de Monedas Uniforme**: Los montos siempre se devuelven como objetos `{ value: "150.50", currency: "USD" }`.

---

## 2. Formatos Globales

### 2.1 Formato de Monto (Money DTO)

Para evitar problemas de precisión en JSON con números flotantes, los valores monetarios siempre viajan como `string`.

```json
{
  "amount": {
    "value": "1250.50",
    "currency": "USD"
  }
}
```

### 2.2 Respuesta Paginada (PaginatedResponse<T>)

```json
{
  "data": [ ... ],
  "meta": {
    "total_items": 145,
    "total_pages": 15,
    "current_page": 1,
    "per_page": 10,
    "has_next": true,
    "has_previous": false
  }
}
```

### 2.3 Respuesta de Error Estandarizada

Basada en RFC 7807 (Problem Details for HTTP APIs).

```json
{
  "error": {
    "code": "TRX_004",
    "message": "La fecha de la transacción no puede ser mayor a 7 días en el futuro.",
    "status": 400,
    "details": {
      "field": "date",
      "provided_value": "2027-01-01"
    }
  },
  "request_id": "req-123456789"
}
```

---

## 3. Mapeo de Excepciones de Dominio a HTTP

Las excepciones definidas en el Domain Model (`03-domain-model.md`, sección 3) se interceptan a nivel global y se traducen a respuestas HTTP.

| Domain Exception                 | Código HTTP                 | Mensaje al Usuario                                                                         |
| -------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `ValidationException`            | `400 Bad Request`           | Mensaje detallado del error de validación (ej. campos faltantes o formato incorrecto).     |
| `BusinessRuleViolationException` | `422 Unprocessable Entity`  | Error de regla de negocio (ej. "No se puede eliminar una categoría con transacciones").    |
| `InvariantViolationException`    | `500 Internal Server Error` | Error crítico. El mensaje detallado NO se expone al usuario. Se registra en logs.          |
| `ConcurrencyException`           | `409 Conflict`              | "El recurso fue modificado por otra operación. Por favor, recarga y vuelve a intentarlo."  |
| `FeatureNotAvailableException`   | `503 Service Unavailable`   | "Esta funcionalidad no está disponible en este momento."                                   |
| _No autenticado_                 | `401 Unauthorized`          | "Sesión inválida o expirada."                                                              |
| _Recurso ajeno o inexistente_    | `404 Not Found`             | "El recurso no existe." (Por seguridad, no distinguimos entre "no es tuyo" y "no existe"). |

---

## 4. Endpoints: Auth & Sesiones

### `POST /api/v1/auth/login`

- **Uso**: Iniciar sesión.
- **Request**: `{ "email": "user@example.com", "password": "..." }`
- **Response** `200 OK` (Incluye header `Set-Cookie: session_id=...; HttpOnly; Secure`):
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "default_currency": "USD"
    }
  }
  ```

### `POST /api/v1/auth/register`

- **Uso**: Registrar un nuevo usuario. Crea automáticamente configuraciones por defecto.
- **Response** `201 Created`: Similar al login.

### `POST /api/v1/auth/logout`

- **Uso**: Revoca la sesión actual (modifica `sessions.revoked_at`).
- **Response** `204 No Content`.

---

## 5. Endpoints: Cuentas (Accounts)

### `GET /api/v1/accounts`

- **Uso**: Obtener todas las cuentas activas del usuario logueado.
- **Response** `200 OK`:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Cartera",
        "type": "CASH",
        "currency": "USD",
        "current_balance": { "value": "150.00", "currency": "USD" },
        "color": "#10B981",
        "icon": "wallet"
      }
    ]
  }
  ```
  _(Nota: `initial_balance` no se expone a menos que se necesite para una vista de configuración)._

### `POST /api/v1/accounts`

- **Uso**: Crear una cuenta.
- **Request**:
  ```json
  {
    "name": "Banco Nacional",
    "type": "CHECKING",
    "currency": "MXN",
    "initial_balance": "5000.00",
    "color": "#3B82F6",
    "icon": "building-bank"
  }
  ```
- **Response** `201 Created`: Devuelve el DTO de la cuenta creada.

### `PATCH /api/v1/accounts/:id`

- **Uso**: Editar metadatos de la cuenta.
- **Request**: Permite enviar `name`, `color`, `icon`. Si la cuenta no tiene transacciones, permite enviar `initial_balance` (ACC-R02).
- **Importante**: `current_balance` no es aceptado. Si se envía, es ignorado.

### `DELETE /api/v1/accounts/:id`

- **Uso**: Archivar una cuenta (Soft delete).
- **Response** `204 No Content`.

---

## 6. Endpoints: Transacciones y Transferencias

### `GET /api/v1/transactions`

- **Uso**: Listar transacciones. Paginado.
- **Query Params**: `page`, `limit`, `account_id`, `category_id`, `start_date`, `end_date`, `type`, `search`.
- **Response** `200 OK`:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "account_id": "uuid",
        "category_id": "uuid",
        "type": "EXPENSE",
        "amount": { "value": "45.50", "currency": "USD" },
        "date": "2026-07-28",
        "description": "Supermercado",
        "is_transfer": false
      }
    ],
    "meta": { ...paginación... }
  }
  ```

### `POST /api/v1/transactions`

- **Uso**: Crear un Ingreso o Egreso.
- **Request**:
  ```json
  {
    "account_id": "uuid",
    "category_id": "uuid",
    "type": "EXPENSE",
    "amount": "45.50",
    "date": "2026-07-28",
    "description": "Supermercado",
    "notes": "Compra para la semana"
  }
  ```
- **Nota sobre validación**: Rechaza si `type === 'TRANSFER'`. Para transferencias, se usa otro endpoint.

### `PATCH /api/v1/transactions/:id`

- **Uso**: Editar una transacción existente.
- **Importante**: `type` no puede modificarse (TRX-R05). Si se envía, lanza error de validación o se ignora. Si la transacción es parte de un `TransferPair`, lanza error (TRF-R05).

### `DELETE /api/v1/transactions/:id`

- **Uso**: Elimina (soft-delete) la transacción. Si es transferencia, falla indicando que debe usar el endpoint de transferencias.

### `POST /api/v1/transfers`

- **Uso**: Crear una transferencia entre dos cuentas.
- **Request**:
  ```json
  {
    "source_account_id": "uuid",
    "destination_account_id": "uuid",
    "amount": "100.00",
    "destination_amount": "100.00", // Para multi-moneda (TRF-R04)
    "date": "2026-07-28",
    "description": "Ahorro mensual"
  }
  ```
- **Response** `201 Created`: Devuelve un DTO que representa el `TransferPair` (con la lista de las 2 transacciones creadas).

### `DELETE /api/v1/transfers/:pair_id`

- **Uso**: Elimina ambas transacciones de una transferencia atómicamente.

---

## 7. Endpoints: Categorías

### `GET /api/v1/categories`

- **Uso**: Obtiene todas las categorías (incluyendo las de `is_system=true`). Devuelve una estructura jerárquica o una lista plana.
- **Response** `200 OK`:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Alimentación",
        "type": "EXPENSE",
        "is_system": true,
        "color": "#F59E0B",
        "icon": "shopping-cart",
        "subcategories": [
          {
            "id": "uuid",
            "name": "Restaurantes",
            "type": "EXPENSE",
            "is_system": true,
            "parent_id": "uuid"
          }
        ]
      }
    ]
  }
  ```

### `POST /api/v1/categories`

- **Uso**: Crear una categoría o subcategoría personalizada.
- **Request**: `parent_id` es opcional.

### `DELETE /api/v1/categories/:id`

- **Uso**: Soft-delete de una categoría personalizada.
- **Validación**: Lanza `422` si `is_system=true` (CAT-R03) o si tiene transacciones activas o soft-deleted (CAT-R04).

---

## 8. Endpoints: Presupuestos (Budgets)

### `GET /api/v1/budgets`

- **Uso**: Obtener presupuestos del usuario autenticado.
- **Query Params**: `status` (opcional, `ACTIVE` | `EXPIRED` | `INACTIVE`). Sin filtro devuelve todos.
- **Comportamiento de expiración (lazy check)**: Antes de devolver la respuesta, el Use Case verifica si algún presupuesto ACTIVE tiene `end_date < today`. Si es así, lo expira (`ACTIVE → EXPIRED`) y persiste el cambio en la misma operación. El frontend siempre recibe el estado real, sin necesidad de un job previo.
- **Response** `200 OK`:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "category_id": "uuid",
        "period": "MONTHLY",
        "amount": { "value": "500.00", "currency": "USD" },
        "executed_amount": { "value": "450.00", "currency": "USD" },
        "remaining_amount": { "value": "50.00", "currency": "USD" },
        "available_amount": { "value": "50.00", "currency": "USD" },
        "execution_percentage": 90.0,
        "is_over_budget": false,
        "alert_threshold": 80,
        "status": "ACTIVE",
        "start_date": "2026-07-01",
        "end_date": "2026-07-31"
      }
    ]
  }
  ```
  **Nota**: `remaining_amount`, `available_amount` y `execution_percentage` son calculados por la entidad `Budget` y enviados en el DTO, ahorrándole el cálculo al frontend. `available_amount` es siempre >= 0 (puede diferir de `remaining_amount` cuando el presupuesto está excedido).

### `GET /api/v1/budgets/:id`

- **Uso**: Obtener un presupuesto específico.
- **Comportamiento de expiración (lazy check)**: Igual que en `GET /api/v1/budgets` — si el presupuesto está ACTIVE pero `end_date < today`, expira antes de devolver el DTO.
- **Response** `200 OK`: Mismo DTO que el item individual de `GET /api/v1/budgets`.
- **Errores**: `404` si no existe o no pertenece al usuario.

### `POST /api/v1/budgets`

- **Uso**: Crear un presupuesto.
- **Request**:
  ```json
  {
    "category_id": "uuid",
    "period": "MONTHLY",
    "amount": "500.00",
    "currency": "USD",
    "start_date": "2026-07-01",
    "alert_threshold": 80
  }
  ```
  **Campos**:
  - `category_id`: requerido. Debe pertenecer al usuario o ser categoría del sistema.
  - `period`: requerido. `MONTHLY` | `WEEKLY` | `YEARLY`.
  - `amount`: requerido. String numérico positivo.
  - `currency`: requerido. ISO 4217.
  - `start_date`: requerido. Formato `YYYY-MM-DD`.
  - `alert_threshold`: opcional. Entero 1–100. Default: 80.
  - `end_date`: **NO aceptado**. El backend lo calcula automáticamente según `period` y `start_date`.
- **Response** `201 Created`: Devuelve el DTO completo del presupuesto creado, incluyendo `end_date` calculado.
- **Errores**:
  - `422` si ya existe un presupuesto ACTIVE para la misma combinación `(category_id, period, start_date)` — código `BGT_003`.
  - `400` si `amount <= 0` — código `BGT_001`.
  - `400` si `alert_threshold` fuera de rango — código `BGT_002`.

### `PATCH /api/v1/budgets/:id`

- **Uso**: Editar los campos modificables de un presupuesto activo.
- **Request** (todos los campos son opcionales, al menos uno requerido):

  ```json
  {
    "amount": "750.00",
    "alert_threshold": 90
  }
  ```

  **Campos aceptados**:
  - `amount`: nuevo límite del presupuesto. String numérico positivo.
  - `alert_threshold`: nuevo umbral de alerta. Entero 1–100.

  **Campos NO aceptados** (si se envían, se rechaza con `400`):
  `category_id`, `period`, `start_date`, `end_date`, `status`, `executed_amount`, `currency`.

- **Comportamiento interno**: El Use Case llama a `budget.updateAmount()` y/o `budget.updateAlertThreshold()` según los campos presentes en el request. Operaciones independientes sobre el mismo agregado en una sola request.
- **Response** `200 OK`: Devuelve el DTO completo actualizado.
- **Errores**:
  - `404` si no existe o no pertenece al usuario.
  - `422` si `status !== ACTIVE`.
  - `400` si `amount <= 0` — código `BGT_001`.
  - `400` si `alert_threshold` fuera de rango — código `BGT_002`.

### `POST /api/v1/budgets/:id/deactivate`

- **Uso**: Desactivar manualmente un presupuesto activo (`ACTIVE` → `INACTIVE`).
- **Request**: Vacío.
- **Response** `200 OK`: Devuelve el DTO del presupuesto con `status: "INACTIVE"`.
- **Errores**:
  - `404` si no existe o no pertenece al usuario.
  - `422` si `status !== ACTIVE`.

### `POST /api/v1/budgets/:id/reactivate`

- **Uso**: Reactivar un presupuesto inactivo (`INACTIVE` → `ACTIVE`).
- **Request**: Vacío.
- **Response** `200 OK`: Devuelve el DTO del presupuesto con `status: "ACTIVE"`.
- **Errores**:
  - `404` si no existe o no pertenece al usuario.
  - `422` si `status !== INACTIVE`.
  - `422` si ya existe otro presupuesto ACTIVE para la misma combinación `(category_id, period, start_date)` — código `BGT_003`. La unicidad se valida antes de reactivar.

**Nota sobre eliminación**: No existe `DELETE /api/v1/budgets/:id`. Los presupuestos no tienen soft-delete. El ciclo de vida se gestiona exclusivamente con `status`. Un presupuesto `INACTIVE` que ya no se necesita permanece en ese estado para preservar el historial de `executed_amount`.

---

## 9. Endpoints: Metas de Ahorro (Goals)

### `GET /api/v1/goals`

- **Uso**: Obtener metas activas.
- **Response** `200 OK`:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Viaje a Japón",
        "target_amount": { "value": "3000.00", "currency": "USD" },
        "current_amount": { "value": "1500.00", "currency": "USD" },
        "remaining_amount": { "value": "1500.00", "currency": "USD" },
        "progress_percentage": 50.0,
        "status": "ACTIVE",
        "target_date": "2027-12-01"
      }
    ]
  }
  ```

### `POST /api/v1/goals/:id/add-progress`

- **Uso**: Registrar un aporte manual a la meta (GOL-R01).
- **Request**: `{ "amount": "200.00" }`
- **Efecto**: Llama al método `addProgress` de la entidad Goal. Si se completa, el estado en la respuesta reflejará `COMPLETED`.

---

_Documento 05 de 07 — MyMoney API Contracts v1.1 — Julio 2026_
