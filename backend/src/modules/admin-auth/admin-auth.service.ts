import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<{ token: string; admin: any }> {
    if (!username || !password) {
      throw new BadRequestException('Username and Password are required');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate JWT with admin privileges
    const payload = { sub: admin.id, username: admin.username, isAdmin: true };
    const token = await this.jwtService.signAsync(payload);

    // Return admin without password hash
    const { passwordHash, ...adminResult } = admin;

    return {
      token,
      admin: adminResult,
    };
  }

  async forgotRequest(username: string): Promise<{ message: string; maskedMobileNumber: string }> {
    throw new BadRequestException('Password reset is disabled. Please use default credentials.');
  }

  async reset(username: string, otp: string, newUsername?: string, newPassword?: string): Promise<{ message: string }> {
    throw new BadRequestException('Password reset is disabled. Please use default credentials.');
  }

  async getAdminById(adminId: string): Promise<any> {
    let admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      // Fallback: Check if the adminId is actually a User ID matching the admin's mobile number
      const user = await this.prisma.user.findUnique({
        where: { id: adminId },
      });
      if (user) {
        admin = await this.prisma.admin.findFirst({
          where: { mobileNumber: user.mobileNumber },
        });
      }
    }

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    const { passwordHash, ...result } = admin;
    return result;
  }

  private maskPhoneNumber(phone: string): string {
    // Keep first 3 (e.g. +91) and last 4 (e.g. 5394)
    if (phone.length < 8) return '********';
    const prefix = phone.slice(0, 3);
    const suffix = phone.slice(-4);
    return `${prefix}******${suffix}`;
  }
}
