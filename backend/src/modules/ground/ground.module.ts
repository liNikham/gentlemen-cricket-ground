import { Module } from '@nestjs/common';
import { GroundController } from './ground.controller';
import { GroundService } from './ground.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-development',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [GroundController],
  providers: [GroundService],
  exports: [GroundService],
})
export class GroundModule {}
