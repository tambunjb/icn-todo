import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, displayName?: string) {
    email = email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('email already used');

    const passwordHash = await bcrypt.hash(password, 12);
    const u = await this.prisma.user.create({ data: { email, passwordHash, displayName } });

    return { id: u.id, email: u.email, displayName: u.displayName, createdAt: u.createdAt };
  }

  async login(email: string, password: string) {
    email = email.toLowerCase().trim();
    const u = await this.prisma.user.findUnique({ where: { email } });
    if (!u) throw new UnauthorizedException('invalid credentials');

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    const token = await this.jwt.signAsync({ sub: u.id, email: u.email });
    return { accessToken: token, displayName: u.displayName };
  }
}