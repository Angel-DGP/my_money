import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createDemoUser(email: string, name: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
        password_hash: 'demo', // Mock password hash
      }
    });
  }

  async createUser(data: { email: string; name: string; password_hash: string }) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password_hash, salt);

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password_hash: hash,
      },
    });
  }
}
