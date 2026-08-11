import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../users.repository';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hashed',
    phone: null,
    resumeUrl: null,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository);
  });

  describe('register', () => {
    it('creates a user with a hashed password when the email is not taken', async () => {
      repository.findByEmail.mockResolvedValue(null);
      const created = buildUser();
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.register({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com' }),
      );
      const passedHash = repository.create.mock.calls[0][0].passwordHash!;
      expect(await bcrypt.compare('password123', passedHash)).toBe(true);
      expect(result).toBe(created);
    });

    it('throws USERS_002 conflict when the email is already registered', async () => {
      repository.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        }),
      ).rejects.toMatchObject(
        new ConflictException({
          code: 'USERS_002',
          message: 'Email already registered',
        }),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('delegates to the repository', async () => {
      const user = buildUser();
      repository.findByEmail.mockResolvedValue(user);

      await expect(service.findByEmail('jane@example.com')).resolves.toBe(user);
      expect(repository.findByEmail).toHaveBeenCalledWith('jane@example.com');
    });
  });

  describe('updateMe', () => {
    it('merges the DTO into the existing user and saves it', async () => {
      const user = buildUser();
      repository.findById.mockResolvedValue(user);
      repository.save.mockImplementation((u) => Promise.resolve(u));

      const result = await service.updateMe(1, { fullName: 'Jane Updated' });

      expect(result.fullName).toBe('Jane Updated');
      expect(repository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('updateResumeUrl', () => {
    it('sets resumeUrl on the existing user and saves it', async () => {
      const user = buildUser();
      repository.findById.mockResolvedValue(user);
      repository.save.mockImplementation((u) => Promise.resolve(u));

      const result = await service.updateResumeUrl(
        1,
        '/uploads/resumes/foo.pdf',
      );

      expect(result.resumeUrl).toBe('/uploads/resumes/foo.pdf');
    });
  });

  describe('findByIdOrThrow', () => {
    it('returns the user when found', async () => {
      const user = buildUser();
      repository.findById.mockResolvedValue(user);

      await expect(service.findByIdOrThrow(1)).resolves.toBe(user);
    });

    it('throws USERS_001 not found when no user matches', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findByIdOrThrow(999)).rejects.toMatchObject(
        new NotFoundException({ code: 'USERS_001', message: 'User not found' }),
      );
    });
  });

  describe('deactivate', () => {
    it('soft-deletes an existing user', async () => {
      repository.findById.mockResolvedValue(buildUser());
      repository.softDelete.mockResolvedValue(undefined);

      await service.deactivate(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('throws USERS_001 when the user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deactivate(999)).rejects.toMatchObject(
        new NotFoundException({ code: 'USERS_001', message: 'User not found' }),
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });
});
