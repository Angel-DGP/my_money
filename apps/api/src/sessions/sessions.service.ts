import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva sesión y devuelve el token de refresco en texto plano
   * (para enviarlo al cliente) mientras guarda el hash en la BD.
   */
  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

    const session = await this.prisma.session.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        user_agent: userAgent,
        ip_address: ipAddress,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      session,
      plainToken,
    };
  }

  /**
   * Valida un token de refresco en texto plano (enviado desde la cookie)
   */
  async validateRefreshToken(plainToken: string) {
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

    const session = await this.prisma.session.findFirst({
      where: { token_hash: tokenHash },
      include: { user: true },
    });

    if (!session || session.revoked_at || session.expires_at < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!session.user || !session.user.is_active || session.user.deleted_at) {
      throw new UnauthorizedException('User inactive or deleted');
    }

    // Update last_used_at (opcional, en un app real se puede hacer asíncrono o con debounce)
    await this.prisma.session.update({
      where: { id: session.id },
      data: { last_used_at: new Date() },
    });

    return session;
  }

  async revokeSessionByToken(plainToken: string) {
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const session = await this.prisma.session.findFirst({
      where: { token_hash: tokenHash },
    });

    if (session && !session.revoked_at) {
      return this.prisma.session.update({
        where: { id: session.id },
        data: { revoked_at: new Date() },
      });
    }
  }

  // Mantenemos este para backward compatibility o revocar desde panel de control
  async revokeSession(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { revoked_at: new Date() },
    });
  }
}
