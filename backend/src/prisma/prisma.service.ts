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
      const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
      const password = process.env.ADMIN_DEFAULT_PASSWORD || 'adminpassword';
      const mobile = process.env.ADMIN_DEFAULT_MOBILE || '+918208425394';

      const adminCount = await this.admin.count();
      if (adminCount === 0) {
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

      // Also ensure corresponding User record exists for Nikhil Mahadik
      const user = await this.user.findUnique({
        where: { mobileNumber: mobile },
      });

      if (!user) {
        await this.user.create({
          data: {
            mobileNumber: mobile,
            name: 'Nikhil Mahadik',
            email: 'mahadiknikhil2508@gmail.com',
            isProfileCompleted: true,
          },
        });
        this.logger.log(`🚀 Pre-seeded Admin User (Nikhil Mahadik) successfully.`);
      } else if (!user.isProfileCompleted || user.name !== 'Nikhil Mahadik' || user.email !== 'mahadiknikhil2508@gmail.com') {
        await this.user.update({
          where: { mobileNumber: mobile },
          data: {
            name: 'Nikhil Mahadik',
            email: 'mahadiknikhil2508@gmail.com',
            isProfileCompleted: true,
          },
        });
        this.logger.log(`🚀 Updated Admin User details to Nikhil Mahadik.`);
      }
    } catch (error) {
      this.logger.error('Failed to seed default admin account or user:', error);
    }
  }
}
