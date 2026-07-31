import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    return this.prisma.session.create({
      data: {
        user_id: userId,
        token_hash: randomUUID(), // A UUID acting as secure token mapped to the session row
        user_agent: userAgent,
        ip_address: ipAddress,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async validateSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.revoked_at || session.expires_at < new Date()) {
      return null;
    }

    // Update last_used_at (in a real app, you might debounce this to avoid DB hits on every request)
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { last_used_at: new Date() },
    });

    return session.user;
  }

  async revokeSession(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { revoked_at: new Date() },
    });
  }
}
