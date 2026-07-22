import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { GroundModule } from './modules/ground/ground.module';

@Module({
  imports: [AppConfigModule, PrismaModule, AuthModule, AdminAuthModule, GroundModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}