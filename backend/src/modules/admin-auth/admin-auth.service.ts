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
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new NotFoundException('Admin username not found');
    }

    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
      // Clear older OTPs for the admin's phone number
      await this.prisma.otp.deleteMany({
        where: { mobileNumber: admin.mobileNumber },
      });

      // Save new OTP
      await this.prisma.otp.create({
        data: {
          mobileNumber: admin.mobileNumber,
          hashedOtp,
          expiresAt,
        },
      });

      // Send the OTP via WhatsApp
      const sent = await this.whatsappService.sendOtp(admin.mobileNumber, otp);
      if (!sent) {
        throw new InternalServerErrorException('Failed to send OTP via WhatsApp.');
      }

      // Mask the phone number for security in frontend, e.g. +918208425394 -> +91******5394
      const maskedMobileNumber = this.maskPhoneNumber(admin.mobileNumber);

      return {
        message: 'OTP sent successfully to registered WhatsApp number',
        maskedMobileNumber,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred during reset request.');
    }
  }

  async reset(username: string, otp: string, newUsername?: string, newPassword?: string): Promise<{ message: string }> {
    if (!username || !otp) {
      throw new BadRequestException('Username and OTP are required.');
    }

    if (!newUsername && !newPassword) {
      throw new BadRequestException('You must provide either a new username or a new password to reset.');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found.');
    }

    // Retrieve latest OTP for admin's registered mobile number
    const otpRecord = await this.prisma.otp.findFirst({
      where: { mobileNumber: admin.mobileNumber },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('No active OTP request found for this account.');
    }

    // Verify expiry
    if (new Date() > otpRecord.expiresAt) {
      await this.prisma.otp.delete({ where: { id: otpRecord.id } });
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Validate OTP
    const isValid = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP.');
    }

    // Clean up used OTP
    await this.prisma.otp.delete({ where: { id: otpRecord.id } });

    // Build update dataset
    const updateData: any = {};

    if (newUsername) {
      const trimmedUsername = newUsername.trim();
      // Ensure username uniqueness if changed
      if (trimmedUsername !== admin.username) {
        const existingAdmin = await this.prisma.admin.findUnique({
          where: { username: trimmedUsername },
        });
        if (existingAdmin) {
          throw new BadRequestException('New username is already taken.');
        }
        updateData.username = trimmedUsername;
      }
    }

    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Apply updates
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: updateData,
    });

    return { message: 'Admin credentials reset successfully' };
  }

  async getAdminById(adminId: string): Promise<any> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

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
