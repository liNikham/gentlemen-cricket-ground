import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, AdminForgotRequestDto, AdminResetDto } from './dto/admin-auth.dto';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto.username, dto.password);
  }

  @Post('forgot-request')
  async forgotRequest(@Body() dto: AdminForgotRequestDto) {
    return this.adminAuthService.forgotRequest(dto.username);
  }

  @Post('reset')
  async reset(@Body() dto: AdminResetDto) {
    return this.adminAuthService.reset(dto.username, dto.otp, dto.newUsername, dto.newPassword);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async getMe(@Req() req: any) {
    const adminId = req.admin.sub;
    return this.adminAuthService.getAdminById(adminId);
  }
}
