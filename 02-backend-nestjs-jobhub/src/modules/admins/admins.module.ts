import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsRepository } from './admins.repository';
import { AdminsService } from './admins.service';
import { Admin } from './entities/admin.entity';

/**
 * Phase 1: entity + read access only (auth needs it for admin login).
 * Full CRUD controller (`/admin/admins`, RBAC-gated) lands in Phase 2
 * once `RolesGuard` exists.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [AdminsService, AdminsRepository],
  exports: [AdminsService],
})
export class AdminsModule {}
