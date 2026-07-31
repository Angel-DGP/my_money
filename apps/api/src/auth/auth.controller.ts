import { Controller, Post, Body, Req, Res, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body('email') email: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const session = await this.authService.login(email, req.headers['user-agent'], req.ip);
    
    // Set HttpOnly cookie
    res.cookie('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Logged in successfully', user_id: session.user_id };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const sessionId = req.cookies?.['session_id'];
    if (sessionId) {
      await this.authService.logout(sessionId);
      res.clearCookie('session_id');
    }
    return { message: 'Logged out successfully' };
  }
}
