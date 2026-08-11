import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { PermissionsRepository } from '../permissions.repository';
import { RolePermissionsRepository } from '../role-permissions.repository';
import { RolesPermissionsService } from '../roles-permissions.service';
import { RolesRepository } from '../roles.repository';

describe('RolesPermissionsService', () => {
  let service: RolesPermissionsService;
  let rolesRepository: jest.Mocked<RolesRepository>;
  let permissionsRepository: jest.Mocked<PermissionsRepository>;
  let rolePermissionsRepository: jest.Mocked<RolePermissionsRepository>;

  const buildRole = (overrides: Partial<Role> = {}): Role => ({
    id: 1,
    name: 'recruiter',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const buildPermission = (
    overrides: Partial<Permission> = {},
  ): Permission => ({
    id: 1,
    name: 'jobs.create',
    method: 'POST',
    route: '/admin/jobs',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesPermissionsService,
        {
          provide: RolesRepository,
          useValue: {
            findByName: jest.fn(),
            findById: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PermissionsRepository,
          useValue: {
            findById: jest.fn(),
            findByIds: jest.fn(),
            findByName: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: RolePermissionsRepository,
          useValue: {
            findPermissionNamesForRoleIds: jest.fn(),
            roleHasPermission: jest.fn(),
            replaceForRole: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RolesPermissionsService);
    rolesRepository = module.get(RolesRepository);
    permissionsRepository = module.get(PermissionsRepository);
    rolePermissionsRepository = module.get(RolePermissionsRepository);
  });

  describe('findAllRoles', () => {
    it('returns paginated roles with their permission names attached', async () => {
      const role = buildRole();
      rolesRepository.findAndCount.mockResolvedValue([[role], 1]);
      rolePermissionsRepository.findPermissionNamesForRoleIds.mockResolvedValue(
        new Map([['1', ['jobs.create']]]),
      );

      const result = await service.findAllRoles({ page: 1, limit: 20 });

      expect(result.items).toEqual([
        {
          id: 1,
          name: 'recruiter',
          description: null,
          permissions: ['jobs.create'],
        },
      ]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findAllPermissions', () => {
    it('returns paginated permissions', async () => {
      permissionsRepository.findAndCount.mockResolvedValue([
        [buildPermission()],
        1,
      ]);

      const result = await service.findAllPermissions({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createRole', () => {
    it('creates a role when the name is not taken', async () => {
      rolesRepository.findByName.mockResolvedValue(null);
      const created = buildRole();
      rolesRepository.create.mockReturnValue(created);
      rolesRepository.save.mockResolvedValue(created);

      const result = await service.createRole({ name: 'recruiter' });

      expect(result.name).toBe('recruiter');
      expect(result.permissions).toEqual([]);
    });

    it('throws RP_002 conflict when the role name already exists', async () => {
      rolesRepository.findByName.mockResolvedValue(buildRole());

      await expect(
        service.createRole({ name: 'recruiter' }),
      ).rejects.toMatchObject(
        new ConflictException({
          code: 'RP_002',
          message: 'Role name already exists',
        }),
      );
      expect(rolesRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('assignPermissions', () => {
    it('replaces the role permissions when role and all permission ids exist', async () => {
      rolesRepository.findById.mockResolvedValue(buildRole());
      permissionsRepository.findByIds.mockResolvedValue([buildPermission()]);
      rolePermissionsRepository.replaceForRole.mockResolvedValue(undefined);

      const result = await service.assignPermissions(1, { permissionIds: [1] });

      expect(rolePermissionsRepository.replaceForRole).toHaveBeenCalledWith(
        1,
        [1],
      );
      expect(result.permissions).toEqual(['jobs.create']);
    });

    it('throws RP_001 when the role does not exist', async () => {
      rolesRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignPermissions(999, { permissionIds: [1] }),
      ).rejects.toMatchObject(
        new NotFoundException({ code: 'RP_001', message: 'Role not found' }),
      );
      expect(rolePermissionsRepository.replaceForRole).not.toHaveBeenCalled();
    });

    it('throws RP_001 when a permission id does not exist', async () => {
      rolesRepository.findById.mockResolvedValue(buildRole());
      permissionsRepository.findByIds.mockResolvedValue([]);

      await expect(
        service.assignPermissions(1, { permissionIds: [999] }),
      ).rejects.toMatchObject(
        new NotFoundException({
          code: 'RP_001',
          message: 'One or more permissions not found',
        }),
      );
      expect(rolePermissionsRepository.replaceForRole).not.toHaveBeenCalled();
    });
  });

  describe('roleHasPermission', () => {
    it('delegates to the repository', async () => {
      rolePermissionsRepository.roleHasPermission.mockResolvedValue(true);

      await expect(service.roleHasPermission(1, 'jobs.create')).resolves.toBe(
        true,
      );
      expect(rolePermissionsRepository.roleHasPermission).toHaveBeenCalledWith(
        1,
        'jobs.create',
      );
    });
  });

  describe('roleExistsOrThrow', () => {
    it('resolves when the role exists', async () => {
      rolesRepository.findById.mockResolvedValue(buildRole());
      await expect(service.roleExistsOrThrow(1)).resolves.toBeUndefined();
    });

    it('throws RP_001 when the role does not exist', async () => {
      rolesRepository.findById.mockResolvedValue(null);
      await expect(service.roleExistsOrThrow(999)).rejects.toMatchObject(
        new NotFoundException({ code: 'RP_001', message: 'Role not found' }),
      );
    });
  });
});
