import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(SessionGuard)
  getMe(@Req() req: Request & { user: unknown }) {
    return req.user;
  }
}
