import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { RolesPermissionsService } from '../../roles-permissions/roles-permissions.service';
import { AdminsRepository } from '../admins.repository';
import { AdminsService } from '../admins.service';
import { Admin } from '../entities/admin.entity';

describe('AdminsService', () => {
  let service: AdminsService;
  let repository: jest.Mocked<AdminsRepository>;
  let rolesPermissionsService: jest.Mocked<RolesPermissionsService>;

  const buildAdmin = (overrides: Partial<Admin> = {}): Admin => ({
    id: 1,
    fullName: 'Admin One',
    email: 'admin@jobhub.com',
    passwordHash: 'hashed',
    roleId: 1,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        {
          provide: AdminsRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: RolesPermissionsService,
          useValue: { roleExistsOrThrow: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AdminsService);
    repository = module.get(AdminsRepository);
    rolesPermissionsService = module.get(RolesPermissionsService);
  });

  describe('create', () => {
    it('creates an admin with a hashed password when email and role are valid', async () => {
      repository.findByEmail.mockResolvedValue(null);
      rolesPermissionsService.roleExistsOrThrow.mockResolvedValue(undefined);
      const created = buildAdmin();
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.create({
        fullName: 'Admin One',
        email: 'admin@jobhub.com',
        password: 'password123',
        roleId: 1,
      });

      expect(rolesPermissionsService.roleExistsOrThrow).toHaveBeenCalledWith(1);
      const passedHash = repository.create.mock.calls[0][0].passwordHash!;
      expect(await bcrypt.compare('password123', passedHash)).toBe(true);
      expect(result).toBe(created);
    });

    it('throws ADMINS_002 conflict when the email is already registered', async () => {
      repository.findByEmail.mockResolvedValue(buildAdmin());

      await expect(
        service.create({
          fullName: 'Admin One',
          email: 'admin@jobhub.com',
          password: 'password123',
          roleId: 1,
        }),
      ).rejects.toMatchObject(
        new ConflictException({
          code: 'ADMINS_002',
          message: 'Email already registered',
        }),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('validates the new roleId when provided', async () => {
      repository.findById.mockResolvedValue(buildAdmin());
      rolesPermissionsService.roleExistsOrThrow.mockResolvedValue(undefined);
      repository.save.mockImplementation((a) => Promise.resolve(a));

      await service.update(1, { roleId: 2 });

      expect(rolesPermissionsService.roleExistsOrThrow).toHaveBeenCalledWith(2);
    });

    it('throws ADMINS_002 when changing to an email already used by another admin', async () => {
      repository.findById.mockResolvedValue(buildAdmin());
      repository.findByEmail.mockResolvedValue(
        buildAdmin({ id: 2, email: 'taken@jobhub.com' }),
      );

      await expect(
        service.update(1, { email: 'taken@jobhub.com' }),
      ).rejects.toMatchObject(
        new ConflictException({
          code: 'ADMINS_002',
          message: 'Email already registered',
        }),
      );
    });
  });

  describe('deactivate', () => {
    it('soft-deletes an existing admin', async () => {
      repository.findById.mockResolvedValue(buildAdmin());

      await service.deactivate(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('throws ADMINS_001 when the admin does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deactivate(999)).rejects.toMatchObject(
        new NotFoundException({
          code: 'ADMINS_001',
          message: 'Admin not found',
        }),
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });
});
