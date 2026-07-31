# Frontend Guidelines & Conventions (Fase 1)

Este documento establece las reglas estrictas de integración entre el frontend y el backend para My Money. Antes de escribir cualquier componente funcional o de UI, todos los desarrolladores deben adherirse a estas convenciones.

## 1. Cliente Axios & Interceptores

Todo el tráfico de red debe pasar por una única instancia de Axios. **Está estrictamente prohibido usar `fetch` directamente o acceder a `axios` desde un componente.**

### Regla Estricta de Flujo de Datos
El acceso a la red NUNCA se hace desde un componente. El flujo obligatorio es:
`Component → Hook (TanStack) → Service → API Client (Axios)`

### Configuración Base (`shared/api/http-client.ts`)
```typescript
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Interceptores (Auth y Errores)
```typescript
// 1. Auth Interceptor
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Error Interceptor
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // La lógica de manejo global de errores reside aquí
    return Promise.reject(error);
  }
);
```

---

## 2. Estrategia de Autenticación

El estado de sesión del cliente deriva exclusivamente de la presencia y validez del JWT.

1. **Almacenamiento**: El JWT vivirá en `localStorage` (key: `access_token`).
2. **Ciclo de vida**:
   - **Login**: `useMutation` a `/auth/login`. Si el servidor retorna 200, se guarda el token en `localStorage` y se redirige a `/`.
   - **Logout**: Se borra el token de `localStorage`, se ejecuta `queryClient.clear()` para purgar el caché, y se redirige a `/login`.
3. **Flujo de Rutas Protegidas**:
   La lógica de validación de sesión no vive dentro del componente estructural de rutas. El flujo es:
   `AuthGuard (Hook useAuth) → ProtectedRoute (Renderizado) → Page`
   
   Ejemplo de implementación:
   ```tsx
   export function ProtectedRoute({ children }) {
     const { isAuthenticated } = useAuth(); // Delegación de lógica
     if (!isAuthenticated) return <Navigate to="/login" replace />;
     return <>{children}</>;
   }
   ```

---

## 3. Manejo Global de Errores

Centralizado en el Interceptor de respuesta de Axios. Este flujo estandariza la respuesta de la UI ante fallas comunes, garantizando predictibilidad:

| HTTP Status | Flujo a ejecutar (Frontend) |
|---|---|
| **401** | `logout()` → Limpiar tokens → Redirigir a `/login` |
| **403** | Mostrar `Toast` (ej. "Acción denegada") |
| **404** | Renderizar componente `<EmptyState>` |
| **422 / 400** | Propagar a React Hook Form para inyectar errores en los inputs |
| **500** | Escalar al `<ErrorBoundary>` más cercano |

---

## 4. Convenciones de TanStack Query

Manejar el estado del servidor con React Query exige rigor para evitar desincronización o sobreescrituras.

### Regla de Oro: Query vs Mutation
- **GET** → `useQuery`
- **POST** → `useMutation`
- **PATCH** → `useMutation`
- **DELETE** → `useMutation`

### Prohibiciones y Buenas Prácticas
- 🚫 **Nunca usar `refetch()` manualmente** en respuesta a una acción del usuario (ej. después de borrar un ítem). 
- ✅ **Siempre usar `queryClient.invalidateQueries({ queryKey: [...] })`** dentro del bloque `onSuccess` de una mutación.
- 🚫 **Nunca duplicar estado del servidor en Zustand**. Si un dato viene de la API, su fuente de verdad es la caché de TanStack. Zustand es solo para estado efímero del cliente.

---

## 5. Catálogo Estructurado de Query Keys

Las Query Keys deben ser obligatoriamente funciones que devuelven arrays inmutables. **Prohibido usar strings sueltos.**

### `shared/api/query-keys.ts`
```typescript
export const queryKeys = {
  accounts: {
    all: () => ['accounts'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.accounts.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.accounts.all(), 'detail', id] as const,
  },
  transactions: {
    all: () => ['transactions'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.transactions.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all(), 'detail', id] as const,
  },
  budgets: {
    all: () => ['budgets'] as const,
    list: () => [...queryKeys.budgets.all(), 'list'] as const,
    detail: (id: string) => [...queryKeys.budgets.all(), 'detail', id] as const,
  },
  goals: {
    all: () => ['goals'] as const,
    list: () => [...queryKeys.goals.all(), 'list'] as const,
    detail: (id: string) => [...queryKeys.goals.all(), 'detail', id] as const,
  }
};
```

---

## 6. Convenciones de Formularios

Para garantizar que todos los módulos procesen la captura de datos de forma idéntica, el flujo será el siguiente:

`React Hook Form` → `Zod` → `DTO` (packages/shared) → `Axios` → `TanStack Mutation`.

### Preguntas Clave Resueltas
- **¿Dónde vive la validación?**: Estrictamente en los schemas de Zod, importados de `packages/shared`.
- **¿Dónde se muestran los errores locales?**: Los renderiza RHF directamente bajo cada Input usando el resolver de Zod.
- **¿Cómo se transforman los mensajes del backend (400/422)?**: En el bloque `onError` de la mutación, se capturan y se inyectan dinámicamente con el método `setError` de RHF en el campo correspondiente.

---

## 7. Configuración de Providers Globales

El orden en el nivel superior (`<App>`) es estricto y secuencial para asegurar precedencia:

```tsx
<App>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </QueryClientProvider>
</App>
```

**Comportamiento de ThemeProvider**:
- Estados: `light`, `dark`, `system`.
- Persistencia: Lee y guarda la preferencia manual en `LocalStorage`.
- Aplicación: Alterna dinámicamente la clase `.dark` en el nodo raíz de HTML para activar los Design Tokens (Variables CSS) correspondientes.

---

## 8. Arquitectura del Design System

Para mantener la mantenibilidad del sistema y evitar dependencias circulares, los componentes de UI deben respetar un estricto orden de dependencias basado en niveles.

**Regla de Dependencias**: Todos los componentes nuevos deben depender únicamente de componentes del mismo nivel o inferiores. **Nunca** pueden depender de componentes de un nivel superior.

**Jerarquía de Niveles:**

- **Nivel 0** (Primitivos base): `Icon`, `Label`
- **Nivel 1** (Formularios básicos e interacciones): `Button`, `Input` (Pueden usar Nivel 0)
- **Nivel 2** (Indicadores visuales simples): `Badge`, `Spinner`, `Divider` (Pueden usar Nivel 0, 1)
- **Nivel 3** (Componentes complejos/Contenedores): `Card`, `Dialog`, `Modal`, `Tabs`, `Dropdown`, `Toast`, `Table` (Pueden usar Nivel 0, 1, 2)
- **Nivel 4** (Componentes compuestos): `Amount`, `MoneyInput`, `CurrencyField`, `BudgetProgress`, `GoalProgress`, `TransactionCard`.

### Regla Estricta de Componentes Compuestos (Nivel 4)
> **Regla de composición:** Un componente compuesto puede depender únicamente de componentes del Design System y utilidades compartidas. Nunca puede importar hooks de negocio, servicios HTTP, TanStack Query, Zustand ni lógica específica de un módulo. Toda esa lógica de dominio debe vivir en la capa *Feature* de la aplicación, y se debe pasar únicamente data estructurada a través de las *props*.

