import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import { PaginatedResult } from '../../shared/types/api-response.type';
import type { PaginationQuery } from '../../shared/utils/pagination.util';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { RolesPermissionsService } from './roles-permissions.service';

@Controller('admin')
export class RolesPermissionsController {
  constructor(
    private readonly rolesPermissionsService: RolesPermissionsService,
  ) {}

  @Get('roles')
  @RequirePermission('roles.read')
  findAllRoles(
    @Query() query: PaginationQuery,
  ): Promise<PaginatedResult<RoleResponseDto>> {
    return this.rolesPermissionsService.findAllRoles(query);
  }

  @Post('roles')
  @RequirePermission('roles.create')
  createRole(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesPermissionsService.createRole(dto);
  }

  @Patch('roles/:id/permissions')
  @RequirePermission('roles.update')
  assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto,
  ): Promise<RoleResponseDto> {
    return this.rolesPermissionsService.assignPermissions(id, dto);
  }

  @Get('permissions')
  @RequirePermission('permissions.read')
  findAllPermissions(
    @Query() query: PaginationQuery,
  ): Promise<PaginatedResult<PermissionResponseDto>> {
    return this.rolesPermissionsService.findAllPermissions(query);
  }
}
