import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  correlationId?: string;
}

export const auditContextStorage = new AsyncLocalStorage<AuditContext>();
