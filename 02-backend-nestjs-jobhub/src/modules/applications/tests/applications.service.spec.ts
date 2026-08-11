import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from '../../jobs/entities/job.entity';
import { JobsService } from '../../jobs/jobs.service';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { ApplicationsRepository } from '../applications.repository';
import { ApplicationsService } from '../applications.service';
import { Application } from '../entities/application.entity';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repository: jest.Mocked<ApplicationsRepository>;
  let jobsService: jest.Mocked<JobsService>;
  let usersService: jest.Mocked<UsersService>;

  const buildJob = (overrides: Partial<Job> = {}): Job => ({
    id: 10,
    companyId: 1,
    categoryId: 1,
    title: 'Backend Engineer',
    slug: 'backend-engineer',
    description: 'desc',
    employmentType: 'full_time',
    salaryMin: null,
    salaryMax: null,
    status: 'published',
    expiresAt: null,
    approvedBy: 3,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 5,
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hash',
    phone: null,
    resumeUrl: 'https://cdn.example.com/resume.pdf',
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const buildApplication = (overrides: Partial<Application> = {}): Application => ({
    id: 1,
    jobId: 10,
    userId: 5,
    resumeUrl: 'https://cdn.example.com/resume.pdf',
    coverLetter: null,
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: ApplicationsRepository,
          useValue: {
            findById: jest.fn(),
            findByJobAndUser: jest.fn(),
            findAndCountByUser: jest.fn(),
            findAndCountByJob: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JobsService,
          useValue: {
            findByIdOrThrow: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByIdOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationsService);
    repository = module.get(ApplicationsRepository);
    jobsService = module.get(JobsService);
    usersService = module.get(UsersService);
  });

  describe('apply', () => {
    it('creates an application with a resume snapshot from the user profile', async () => {
      jobsService.findByIdOrThrow.mockResolvedValue(buildJob());
      repository.findByJobAndUser.mockResolvedValue(null);
      usersService.findByIdOrThrow.mockResolvedValue(buildUser());
      const created = buildApplication();
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.apply(10, 5, {});

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeUrl: 'https://cdn.example.com/resume.pdf',
          status: 'pending',
        }),
      );
      expect(result).toBe(created);
    });

    it('throws APPLICATIONS_002 when the user already applied', async () => {
      jobsService.findByIdOrThrow.mockResolvedValue(buildJob());
      repository.findByJobAndUser.mockResolvedValue(buildApplication());

      await expect(service.apply(10, 5, {})).rejects.toMatchObject(
        new ConflictException({
          code: 'APPLICATIONS_002',
          message: 'Already applied to this job',
        }),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws JOBS_002 when the job is not published', async () => {
      jobsService.findByIdOrThrow.mockResolvedValue(buildJob({ status: 'draft' }));

      await expect(service.apply(10, 5, {})).rejects.toMatchObject(
        new ConflictException({
          code: 'JOBS_002',
          message: 'Job is closed or expired',
        }),
      );
    });

    it('throws a validation error when the user has no resume on file', async () => {
      jobsService.findByIdOrThrow.mockResolvedValue(buildJob());
      repository.findByJobAndUser.mockResolvedValue(null);
      usersService.findByIdOrThrow.mockResolvedValue(buildUser({ resumeUrl: null }));

      await expect(service.apply(10, 5, {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('updates status and stamps reviewedBy/reviewedAt', async () => {
      repository.findById.mockResolvedValue(buildApplication());
      repository.save.mockImplementation((a) => Promise.resolve(a));

      const result = await service.updateStatus(1, { status: 'shortlisted' }, 3);

      expect(result.status).toBe('shortlisted');
      expect(result.reviewedBy).toBe(3);
      expect(result.reviewedAt).toBeInstanceOf(Date);
    });
  });
});
