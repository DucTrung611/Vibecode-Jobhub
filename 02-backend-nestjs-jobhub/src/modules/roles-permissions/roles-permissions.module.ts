import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

/**
 * Minimal slice for Phase 1: only the `roles` table, needed to satisfy
 * `admins.role_id` FK. Full roles-permissions feature (permissions,
 * role_permissions, RolesGuard, /admin/roles endpoints) lands in Phase 2.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  exports: [TypeOrmModule],
})
export class RolesPermissionsModule {}
