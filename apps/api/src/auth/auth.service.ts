import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  async login(email: string, userAgent?: string, ipAddress?: string) {
    let user = await this.usersService.findByEmail(email);
    
    // Auto-create user for demo/MVP purposes if it doesn't exist
    if (!user) {
      user = await this.usersService.createDemoUser(email, email.split('@')[0]);
    }

    const session = await this.sessionsService.createSession(user.id, userAgent, ipAddress);
    return session;
  }

  async logout(sessionId: string) {
    await this.sessionsService.revokeSession(sessionId);
  }
}
