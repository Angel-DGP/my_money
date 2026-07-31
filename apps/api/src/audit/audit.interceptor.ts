import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { auditContextStorage } from './audit.context';
import { randomUUID } from 'crypto';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    
    const auditContext = {
      userId: request.user?.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      requestId: (request.headers['x-request-id'] as string) || randomUUID(),
      correlationId: (request.headers['x-correlation-id'] as string) || randomUUID(),
    };

    return auditContextStorage.run(auditContext, () => {
      return next.handle();
    });
  }
}
