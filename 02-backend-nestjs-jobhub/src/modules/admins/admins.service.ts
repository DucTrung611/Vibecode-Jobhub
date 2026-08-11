import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RolesPermissionsService } from '../roles-permissions/roles-permissions.service';
import { PaginatedResult } from '../../shared/types/api-response.type';
import { assignDefined } from '../../shared/utils/object.util';
import {
  buildPaginationMeta,
  normalizePagination,
  PaginationQuery,
} from '../../shared/utils/pagination.util';
import { AdminsRepository } from './admins.repository';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class AdminsService {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly rolesPermissionsService: RolesPermissionsService,
  ) {}

  findByEmail(email: string): Promise<Admin | null> {
    return this.adminsRepository.findByEmail(email);
  }

  async findByIdOrThrow(id: number): Promise<Admin> {
    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException({
        code: 'ADMINS_001',
        message: 'Admin not found',
      });
    }
    return admin;
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Admin>> {
    const { page, limit, skip } = normalizePagination(query);
    const [items, total] = await this.adminsRepository.findAndCount(
      skip,
      limit,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async create(dto: CreateAdminDto): Promise<Admin> {
    const existing = await this.adminsRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        code: 'ADMINS_002',
        message: 'Email already registered',
      });
    }
    await this.rolesPermissionsService.roleExistsOrThrow(dto.roleId);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const admin = this.adminsRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      roleId: dto.roleId,
    });
    return this.adminsRepository.save(admin);
  }

  async update(id: number, dto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findByIdOrThrow(id);

    if (dto.email && dto.email !== admin.email) {
      const existing = await this.adminsRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException({
          code: 'ADMINS_002',
          message: 'Email already registered',
        });
      }
    }
    if (dto.roleId !== undefined) {
      await this.rolesPermissionsService.roleExistsOrThrow(dto.roleId);
    }

    assignDefined(admin, dto);
    return this.adminsRepository.save(admin);
  }

  async deactivate(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.adminsRepository.softDelete(id);
  }
}
