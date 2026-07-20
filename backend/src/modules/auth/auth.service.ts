import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(mobileNumber: string): Promise<{ message: string }> {
    if (!mobileNumber) {
      throw new BadRequestException('Mobile number is required');
    }

    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP for security
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      // Delete any existing OTPs for this number to clean up database
      await this.prisma.otp.deleteMany({
        where: { mobileNumber },
      });

      // Save hashed OTP to database
      await this.prisma.otp.create({
        data: {
          mobileNumber,
          hashedOtp,
          expiresAt,
        },
      });

      // Send the OTP via WhatsApp
      const sent = await this.whatsappService.sendOtp(mobileNumber, otp);
      if (!sent) {
        throw new InternalServerErrorException('Failed to send OTP via WhatsApp. Check backend configuration.');
      }

      return { message: 'OTP sent successfully' };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while generating or sending OTP.');
    }
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<{ isProfileCompleted: boolean; token: string; user: any }> {
    if (!mobileNumber || !otp) {
      throw new BadRequestException('Mobile number and OTP are required');
    }

    // Find the latest OTP record
    const otpRecord = await this.prisma.otp.findFirst({
      where: { mobileNumber },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('No OTP request found for this mobile number.');
    }

    // Verify expiry
    if (new Date() > otpRecord.expiresAt) {
      // Clean up expired record
      await this.prisma.otp.delete({ where: { id: otpRecord.id } });
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Compare hashed OTP
    const isValid = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP.');
    }

    // Delete verified OTP so it cannot be reused
    await this.prisma.otp.delete({ where: { id: otpRecord.id } });

    // Check if the mobile number matches any Admin
    const admin = await this.prisma.admin.findFirst({
      where: { mobileNumber },
    });
    const isAdmin = !!admin;

    // Look up or create user
    let user = await this.prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          mobileNumber,
          isProfileCompleted: isAdmin ? true : false,
          name: isAdmin ? 'Nikhil Mahadik' : null,
          email: isAdmin ? 'mahadiknikhil2508@gmail.com' : null,
        },
      });
    } else if (isAdmin && (!user.isProfileCompleted || user.name !== 'Nikhil Mahadik' || user.email !== 'mahadiknikhil2508@gmail.com')) {
      user = await this.prisma.user.update({
        where: { mobileNumber },
        data: {
          isProfileCompleted: true,
          name: 'Nikhil Mahadik',
          email: 'mahadiknikhil2508@gmail.com',
        },
      });
    }

    // Generate JWT token including isAdmin claim if applicable
    const payload = { 
      sub: user.id, 
      isProfileCompleted: user.isProfileCompleted,
      isAdmin 
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      isProfileCompleted: user.isProfileCompleted,
      token,
      user: {
        ...user,
        isAdmin,
      },
    };
  }

  async completeProfile(userId: string, name: string, email: string): Promise<{ token: string; user: any }> {
    if (!name || !email) {
      throw new BadRequestException('Name and Email are required to complete profile.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Update user details and complete profile
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        isProfileCompleted: true,
      },
    });

    const admin = await this.prisma.admin.findFirst({
      where: { mobileNumber: updatedUser.mobileNumber },
    });
    const isAdmin = !!admin;

    // Generate a fresh JWT indicating profile completion and admin status
    const payload = { sub: updatedUser.id, isProfileCompleted: true, isAdmin };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        ...updatedUser,
        isAdmin,
      },
    };
  }

  async getUserById(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const admin = await this.prisma.admin.findFirst({
      where: { mobileNumber: user.mobileNumber },
    });

    return {
      ...user,
      isAdmin: !!admin,
    };
  }
}
