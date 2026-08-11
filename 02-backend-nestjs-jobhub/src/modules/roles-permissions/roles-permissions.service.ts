import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResult } from '../../shared/types/api-response.type';
import {
  buildPaginationMeta,
  normalizePagination,
  PaginationQuery,
} from '../../shared/utils/pagination.util';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { PermissionsRepository } from './permissions.repository';
import { RolePermissionsRepository } from './role-permissions.repository';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesPermissionsService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolePermissionsRepository: RolePermissionsRepository,
  ) {}

  async findAllRoles(
    query: PaginationQuery,
  ): Promise<PaginatedResult<RoleResponseDto>> {
    const { page, limit, skip } = normalizePagination(query);
    const [roles, total] = await this.rolesRepository.findAndCount(skip, limit);
    const permissionsByRoleId =
      await this.rolePermissionsRepository.findPermissionNamesForRoleIds(
        roles.map((role) => role.id),
      );

    const items = roles.map((role) =>
      RoleResponseDto.fromEntity(
        role,
        permissionsByRoleId.get(String(role.id)) ?? [],
      ),
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async createRole(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.rolesRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException({
        code: 'RP_002',
        message: 'Role name already exists',
      });
    }
    const role = this.rolesRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    const saved = await this.rolesRepository.save(role);
    return RoleResponseDto.fromEntity(saved, []);
  }

  async findAllPermissions(
    query: PaginationQuery,
  ): Promise<PaginatedResult<PermissionResponseDto>> {
    const { page, limit, skip } = normalizePagination(query);
    const [permissions, total] = await this.permissionsRepository.findAndCount(
      skip,
      limit,
    );
    return {
      items: permissions.map((permission) =>
        PermissionResponseDto.fromEntity(permission),
      ),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async assignPermissions(
    roleId: number,
    dto: AssignPermissionsDto,
  ): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException({
        code: 'RP_001',
        message: 'Role not found',
      });
    }

    const permissions = await this.permissionsRepository.findByIds(
      dto.permissionIds,
    );
    if (permissions.length !== dto.permissionIds.length) {
      throw new NotFoundException({
        code: 'RP_001',
        message: 'One or more permissions not found',
      });
    }

    await this.rolePermissionsRepository.replaceForRole(
      roleId,
      dto.permissionIds,
    );
    return RoleResponseDto.fromEntity(
      role,
      permissions.map((permission) => permission.name),
    );
  }

  roleHasPermission(roleId: number, permissionName: string): Promise<boolean> {
    return this.rolePermissionsRepository.roleHasPermission(
      roleId,
      permissionName,
    );
  }

  async roleExistsOrThrow(roleId: number): Promise<void> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException({
        code: 'RP_001',
        message: 'Role not found',
      });
    }
  }
}
