import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.mobileNumber);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.mobileNumber, dto.otp);
  }

  @Post('complete-profile')
  @UseGuards(AuthGuard)
  async completeProfile(@Req() req: any, @Body() dto: CompleteProfileDto) {
    const userId = req.user.sub;
    return this.authService.completeProfile(userId, dto.name, dto.email);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: any) {
    const userId = req.user.sub;
    return this.authService.getUserById(userId);
  }
}
