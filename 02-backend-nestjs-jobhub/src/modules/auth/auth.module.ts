import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsModule } from '../admins/admins.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    AdminsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensRepository],
})
export class AuthModule {}
