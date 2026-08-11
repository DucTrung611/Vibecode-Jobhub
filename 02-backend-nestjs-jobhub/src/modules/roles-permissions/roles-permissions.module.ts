import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { PermissionsRepository } from './permissions.repository';
import { RolePermissionsRepository } from './role-permissions.repository';
import { RolesPermissionsController } from './roles-permissions.controller';
import { RolesPermissionsService } from './roles-permissions.service';
import { RolesRepository } from './roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [RolesPermissionsController],
  providers: [
    RolesPermissionsService,
    RolesRepository,
    PermissionsRepository,
    RolePermissionsRepository,
  ],
  exports: [RolesPermissionsService],
})
export class RolesPermissionsModule {}
