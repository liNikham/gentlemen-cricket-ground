import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.seedAdmin();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedAdmin() {
    try {
      const adminCount = await this.admin.count();
      if (adminCount === 0) {
        const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
        const password = process.env.ADMIN_DEFAULT_PASSWORD || 'adminpassword';
        const mobile = process.env.ADMIN_DEFAULT_MOBILE || '+918208425394';

        const passwordHash = await bcrypt.hash(password, 10);

        await this.admin.create({
          data: {
            username,
            passwordHash,
            mobileNumber: mobile,
          },
        });

        this.logger.log(`🚀 Default Admin seeded successfully: username="${username}" mobile="${mobile}"`);
      }
    } catch (error) {
      this.logger.error('Failed to seed default admin account:', error);
    }
  }
}
