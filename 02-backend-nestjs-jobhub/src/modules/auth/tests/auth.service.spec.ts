import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../../admins/admins.service';
import { Admin } from '../../admins/entities/admin.entity';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokensRepository } from '../refresh-tokens.repository';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let adminsService: jest.Mocked<AdminsService>;
  let refreshTokensRepository: jest.Mocked<RefreshTokensRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const PASSWORD = 'password123';
  let passwordHash: string;

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash,
    phone: null,
    resumeUrl: null,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const buildAdmin = (overrides: Partial<Admin> = {}): Admin => ({
    id: 1,
    fullName: 'Admin One',
    email: 'admin@jobhub.com',
    passwordHash,
    roleId: 1,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const buildRefreshToken = (
    overrides: Partial<RefreshToken> = {},
  ): RefreshToken => ({
    id: 1,
    ownerId: 1,
    ownerType: 'user',
    tokenHash: 'hash',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    createdAt: new Date(),
    ...overrides,
  });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(PASSWORD, 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByIdOrThrow: jest.fn(),
            register: jest.fn(),
          },
        },
        {
          provide: AdminsService,
          useValue: { findByEmail: jest.fn(), findByIdOrThrow: jest.fn() },
        },
        {
          provide: RefreshTokensRepository,
          useValue: {
            findByHash: jest.fn(),
            create: jest.fn(
              (data: Partial<RefreshToken>) => data as RefreshToken,
            ),
            save: jest.fn((token: RefreshToken) => Promise.resolve(token)),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed.jwt.token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'jwt.refreshTtlSeconds'
                ? 604800
                : key === 'jwt.accessTtlSeconds'
                  ? 900
                  : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    adminsService = module.get(AdminsService);
    refreshTokensRepository = module.get(RefreshTokensRepository);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('issues a token pair when the email/password matches a user', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      const result = await service.login({
        email: 'jane@example.com',
        password: PASSWORD,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, type: 'user' });
      expect(result.user).toEqual({
        id: 1,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      });
      expect(result.expiresIn).toBe(900);
    });

    it('falls back to admins when no user matches the email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      adminsService.findByEmail.mockResolvedValue(buildAdmin());

      const result = await service.login({
        email: 'admin@jobhub.com',
        password: PASSWORD,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, type: 'admin' });
      expect(result.user.email).toBe('admin@jobhub.com');
    });

    it('throws AUTH_001 when no user or admin matches the email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      adminsService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: PASSWORD }),
      ).rejects.toMatchObject(
        new UnauthorizedException({
          code: 'AUTH_001',
          message: 'Invalid credentials',
        }),
      );
    });

    it('throws AUTH_001 when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.login({
          email: 'jane@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toMatchObject(
        new UnauthorizedException({
          code: 'AUTH_001',
          message: 'Invalid credentials',
        }),
      );
    });
  });

  describe('refresh', () => {
    it('rotates the token and issues a new pair when the refresh token is valid', async () => {
      const existing = buildRefreshToken();
      refreshTokensRepository.findByHash.mockResolvedValue(existing);
      usersService.findByIdOrThrow.mockResolvedValue(buildUser());

      const result = await service.refresh('raw-refresh-token');

      expect(existing.revokedAt).not.toBeNull();
      expect(refreshTokensRepository.save).toHaveBeenCalledWith(existing);
      expect(result.accessToken).toBe('signed.jwt.token');
    });

    it('throws AUTH_002 when the refresh token is not found', async () => {
      refreshTokensRepository.findByHash.mockResolvedValue(null);

      await expect(service.refresh('unknown-token')).rejects.toMatchObject(
        new UnauthorizedException({
          code: 'AUTH_002',
          message: 'Refresh token expired or invalid',
        }),
      );
    });

    it('throws AUTH_002 when the refresh token was already revoked', async () => {
      refreshTokensRepository.findByHash.mockResolvedValue(
        buildRefreshToken({ revokedAt: new Date() }),
      );

      await expect(service.refresh('revoked-token')).rejects.toMatchObject(
        new UnauthorizedException({
          code: 'AUTH_002',
          message: 'Refresh token expired or invalid',
        }),
      );
    });

    it('throws AUTH_002 when the refresh token has expired', async () => {
      refreshTokensRepository.findByHash.mockResolvedValue(
        buildRefreshToken({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(service.refresh('expired-token')).rejects.toMatchObject(
        new UnauthorizedException({
          code: 'AUTH_002',
          message: 'Refresh token expired or invalid',
        }),
      );
    });
  });

  describe('logout', () => {
    it('revokes the refresh token when found and not already revoked', async () => {
      const existing = buildRefreshToken();
      refreshTokensRepository.findByHash.mockResolvedValue(existing);

      await service.logout('raw-refresh-token');

      expect(existing.revokedAt).not.toBeNull();
      expect(refreshTokensRepository.save).toHaveBeenCalledWith(existing);
    });

    it('does nothing when the refresh token does not exist', async () => {
      refreshTokensRepository.findByHash.mockResolvedValue(null);

      await service.logout('unknown-token');

      expect(refreshTokensRepository.save).not.toHaveBeenCalled();
    });
  });
});
