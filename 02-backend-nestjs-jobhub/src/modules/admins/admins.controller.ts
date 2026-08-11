import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import { PaginatedResult } from '../../shared/types/api-response.type';
import type { PaginationQuery } from '../../shared/utils/pagination.util';
import { AdminsService } from './admins.service';
import { AdminResponseDto } from './dto/admin-response.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @RequirePermission('admins.read')
  async findAll(
    @Query() query: PaginationQuery,
  ): Promise<PaginatedResult<AdminResponseDto>> {
    const result = await this.adminsService.findAll(query);
    return {
      items: result.items.map((admin) => AdminResponseDto.fromEntity(admin)),
      meta: result.meta,
    };
  }

  @Post()
  @RequirePermission('admins.create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAdminDto): Promise<AdminResponseDto> {
    const admin = await this.adminsService.create(dto);
    return AdminResponseDto.fromEntity(admin);
  }

  @Patch(':id')
  @RequirePermission('admins.update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
  ): Promise<AdminResponseDto> {
    const admin = await this.adminsService.update(id, dto);
    return AdminResponseDto.fromEntity(admin);
  }

  @Delete(':id')
  @RequirePermission('admins.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.adminsService.deactivate(id);
  }
}
