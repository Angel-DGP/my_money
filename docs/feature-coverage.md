# Feature Coverage

> Estado de integración por módulo. Actualizar con cada PR que complete una columna.

| Módulo       | Servicio real | UI | Integración FE↔BE | E2E validado |
|---|---|---|---|---|
| Auth         | ✅ | ✅ | 🔄 | ⬜ |
| Accounts     | ✅ | ✅ | 🔄 | ⬜ |
| Categories   | ✅ | ✅ | 🔄 | ⬜ |
| Transactions | ✅ | ✅ | 🔄 | ⬜ |
| Budgets      | ✅ | ✅ | 🔄 | ⬜ |
| Goals        | ✅ | ✅ | 🔄 | ⬜ |

## Leyenda
- ✅ Completo y verificado
- 🔄 Código escrito, pendiente validación contra backend real
- ⬜ Pendiente

---

## Milestones de integración

### Milestone 1 — Auth
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas (error visible en UI)
- [ ] Persistencia de sesión tras recargar la página
- [ ] Refresh automático al expirar el access token
- [ ] Múltiples requests concurrentes con 401 → un solo refresh
- [ ] Refresh fallido → redirect a `/login`
- [ ] Logout limpia sesión y redirige

### Milestone 2 — Accounts
- [ ] Listar cuentas reales
- [ ] Crear cuenta → aparece en la lista
- [ ] Editar cuenta → cambio reflejado
- [ ] Eliminar cuenta → desaparece de la lista
- [ ] Invalidaciones de React Query correctas
- [ ] Dashboard refleja el balance real

### Milestone 3 — Transactions
- [ ] Crear ingreso → saldo de cuenta sube
- [ ] Crear gasto → saldo de cuenta baja
- [ ] Crear transferencia → afecta dos cuentas
- [ ] Dashboard actualiza totales
- [ ] Presupuestos afectados si aplica
- [ ] Optimistic updates visibles y revertidos si hay error

### Milestone 4 — Categories, Budgets, Goals
- [ ] CRUD completo de categorías
- [ ] CRUD completo de presupuestos + progreso real
- [ ] CRUD completo de metas + progreso real

---

## Orden de implementación de servicios
1. **Auth** — desbloquea todo lo demás
2. **Accounts** — valida el patrón CRUD completo
3. **Categories** — replica el patrón (valida reutilización)
4. **Transactions** — primer módulo con invalidaciones cruzadas
5. **Budgets / Goals** — dependen del dominio financiero completo
