import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthenticatedUser | null> {
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      // Auto-create user for demo/MVP purposes
      user = await this.usersService.createDemoUser(email, email.split('@')[0]);
    }

    // For demo MVP: if password is 'demo' and db has 'demo', we allow it
    if (user.password_hash === 'demo' && pass === 'demo') {
      const { password_hash: _password_hash, ...result } = user;
      return result;
    }

    // Real password check
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (isMatch) {
      const { password_hash: _password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: AuthenticatedUser, userAgent?: string, ipAddress?: string) {
    // Generar Refresh Token (Session)
    const { plainToken: refreshToken } = await this.sessionsService.createSession(
      user.id,
      userAgent,
      ipAddress,
    );

    // Generar Access Token (JWT)
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    // Valida y obtiene la sesión de la BD
    const session = await this.sessionsService.validateRefreshToken(refreshToken);

    // Rotación del refresh token: revocar el anterior y crear uno nuevo
    await this.sessionsService.revokeSessionByToken(refreshToken);
    const { plainToken: newRefreshToken } = await this.sessionsService.createSession(
      session.user.id,
      userAgent,
      ipAddress,
    );

    // Generar nuevo Access Token (JWT)
    const payload = { email: session.user.email, sub: session.user.id };
    const accessToken = this.jwtService.sign(payload);

    // Retorna el nuevo access token y el nuevo refresh token
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: session.user,
    };
  }

  async logout(refreshToken: string) {
    await this.sessionsService.revokeSessionByToken(refreshToken);
  }

  async register(data: { email: string; name: string; password_hash: string }, userAgent?: string, ipAddress?: string) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new UnauthorizedException('El correo electrónico ya está registrado');
    }

    const newUser = await this.usersService.createUser(data);

    // Auto login the newly registered user
    const { plainToken: refreshToken } = await this.sessionsService.createSession(
      newUser.id,
      userAgent,
      ipAddress,
    );

    const payload = { email: newUser.email, sub: newUser.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  }
}
