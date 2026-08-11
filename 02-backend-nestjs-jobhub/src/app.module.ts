import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validationSchema } from './config/validation.schema';
import { JwtCoreModule } from './core/auth/jwt-core.module';
import { DatabaseModule } from './core/database/database.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesPermissionsModule } from './modules/roles-permissions/roles-permissions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    JwtCoreModule,
    RolesPermissionsModule,
    UsersModule,
    AdminsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
