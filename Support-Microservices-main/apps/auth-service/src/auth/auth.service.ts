import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  // ================= REGISTER =================
  async register(email: string, password: string) {
    const exists = await this.prisma.auth.findUnique({
      where: { email },
    });

    if (exists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.auth.create({
      data: {
        email,
        password: hash,
      },
    });

    const verifyToken = this.jwt.sign(
      {
        sub: user.id,
        type: 'verify',
      },
      { expiresIn: '15m' },
    );

    await this.mailService.sendVerifyEmail(email, verifyToken);
    
    return {
      message: 'Registered successfully',
      verifyToken,
    };
  }

  // ================= LOGIN =================
  async login(email: string, password: string) {
    const user = await this.prisma.auth.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.verifed) {
      throw new UnauthorizedException('Email not verified');
    }

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      { expiresIn: '1h' },
    );

    return { accessToken };
  }

  // ================= VERIFY =================
  async verify(token: string) {
    const payload = this.jwt.verify(token);

    if (payload.type !== 'verify') {
      throw new UnauthorizedException('Invalid token type');
    }

    await this.prisma.auth.update({
      where: { id: payload.sub },
      data: { verifed: true },
    });

    return { message: 'Account verified' };
  }
}
