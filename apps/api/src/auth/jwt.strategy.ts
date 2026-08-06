import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

// In a real app, use ConfigService to get this secret
export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-my-money-app';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active || !user.deleted_at === null) {
      throw new UnauthorizedException('User is not active or deleted');
    }
    // Only return safe fields
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
