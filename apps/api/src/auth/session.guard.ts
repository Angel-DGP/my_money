import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.['session_id'];

    if (!sessionId) {
      throw new UnauthorizedException('No session cookie found');
    }

    const user = await this.sessionsService.validateSession(sessionId);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach user to request context for downstream handlers
    request.user = user;
    return true;
  }
}
