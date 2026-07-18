import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';

@Module({
  imports: [AppConfigModule, PrismaModule, AuthModule, AdminAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}