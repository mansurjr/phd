import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async login(username: string, pass: string) {
    this.logger.log(`Login attempt for username: ${username}`);
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { username },
      });

      if (admin && (await bcrypt.compare(pass, admin.password))) {
        this.logger.log(`Login successful for username: ${username}`);
        const payload = { username: admin.username, sub: admin.id };
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
      
      this.logger.warn(`Login failed for username: ${username} - Invalid credentials`);
      throw new UnauthorizedException('Xato foydalanuvchi nomi yoki parol');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Login error for username ${username}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Helper to create initial admin if not exists
  async createInitialAdmin() {
    const adminCount = await this.prisma.admin.count();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      });
      console.log('Initial admin created: admin / admin123');
    }
  }
}
