import { Test, TestingModule } from '@nestjs/testing';
import { AdminsService } from '../../../modules/admins/admins.service';
import { Admin } from '../../../modules/admins/entities/admin.entity';
import { RolesPermissionsService } from '../../../modules/roles-permissions/roles-permissions.service';
import { AuthorizationService } from '../authorization.service';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let adminsService: jest.Mocked<AdminsService>;
  let rolesPermissionsService: jest.Mocked<RolesPermissionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        { provide: AdminsService, useValue: { findByIdOrThrow: jest.fn() } },
        {
          provide: RolesPermissionsService,
          useValue: { roleHasPermission: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthorizationService);
    adminsService = module.get(AdminsService);
    rolesPermissionsService = module.get(RolesPermissionsService);
  });

  describe('adminHasPermission', () => {
    it('checks the permission against the admin role when the admin exists', async () => {
      adminsService.findByIdOrThrow.mockResolvedValue({ roleId: 3 } as Admin);
      rolesPermissionsService.roleHasPermission.mockResolvedValue(true);

      await expect(service.adminHasPermission(1, 'jobs.create')).resolves.toBe(
        true,
      );
      expect(rolesPermissionsService.roleHasPermission).toHaveBeenCalledWith(
        3,
        'jobs.create',
      );
    });

    it('returns false when the admin does not exist', async () => {
      adminsService.findByIdOrThrow.mockRejectedValue(new Error('not found'));

      await expect(
        service.adminHasPermission(999, 'jobs.create'),
      ).resolves.toBe(false);
      expect(rolesPermissionsService.roleHasPermission).not.toHaveBeenCalled();
    });
  });
});
