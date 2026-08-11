import { Global, Module } from '@nestjs/common';
import { AdminsModule } from '../../modules/admins/admins.module';
import { RolesPermissionsModule } from '../../modules/roles-permissions/roles-permissions.module';
import { PERMISSION_CHECKER } from '../../shared/types/permission-checker.interface';
import { AuthorizationService } from './authorization.service';

@Global()
@Module({
  imports: [AdminsModule, RolesPermissionsModule],
  providers: [
    AuthorizationService,
    { provide: PERMISSION_CHECKER, useClass: AuthorizationService },
  ],
  exports: [PERMISSION_CHECKER],
})
export class AuthorizationModule {}
