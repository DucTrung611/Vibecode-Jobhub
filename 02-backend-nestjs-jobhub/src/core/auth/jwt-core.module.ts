import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Infra wiring shared by every feature that needs JWT auth: registers the
 * passport 'jwt' strategy once so `shared/guards/jwt-auth.guard.ts` works
 * anywhere, and exposes `JwtService` for the `auth` feature to sign tokens.
 * Global so `users`/`auth`/future admin controllers don't need to import
 * each other's modules just to reach the guard (avoids circular imports).
 */
@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<number>('jwt.accessTtlSeconds'),
        },
      }),
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class JwtCoreModule {}
