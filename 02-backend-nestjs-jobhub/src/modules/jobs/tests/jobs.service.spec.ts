import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from '../../companies/companies.service';
import { CategoriesRepository } from '../categories.repository';
import { Job } from '../entities/job.entity';
import { JobsRepository } from '../jobs.repository';
import { JobsService } from '../jobs.service';
import { SavedJobsRepository } from '../saved-jobs.repository';

describe('JobsService', () => {
  let service: JobsService;
  let jobsRepository: jest.Mocked<JobsRepository>;
  let categoriesRepository: jest.Mocked<CategoriesRepository>;
  let companiesService: jest.Mocked<CompaniesService>;

  const buildJob = (overrides: Partial<Job> = {}): Job => ({
    id: 1,
    companyId: 1,
    categoryId: 1,
    title: 'Backend Engineer',
    slug: 'backend-engineer',
    description: 'desc',
    employmentType: 'full_time',
    salaryMin: null,
    salaryMax: null,
    status: 'draft',
    expiresAt: null,
    approvedBy: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: JobsRepository,
          useValue: {
            findBySlug: jest.fn(),
            findById: jest.fn(),
            findByIds: jest.fn(),
            findAndCount: jest.fn(),
            findLatestPublished: jest.fn(),
            countByCategory: jest.fn(),
            countByStatus: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: CategoriesRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: SavedJobsRepository,
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CompaniesService,
          useValue: {
            findByIdOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(JobsService);
    jobsRepository = module.get(JobsRepository);
    categoriesRepository = module.get(CategoriesRepository);
    companiesService = module.get(CompaniesService);
  });

  describe('create', () => {
    it('creates a draft job with a unique slug', async () => {
      companiesService.findByIdOrThrow.mockResolvedValue({ id: 1 } as never);
      categoriesRepository.findById.mockResolvedValue({ id: 1 } as never);
      jobsRepository.findBySlug.mockResolvedValue(null);
      const created = buildJob();
      jobsRepository.create.mockReturnValue(created);
      jobsRepository.save.mockResolvedValue(created);

      const result = await service.create({
        companyId: 1,
        categoryId: 1,
        title: 'Backend Engineer',
        description: 'desc',
        employmentType: 'full_time',
      });

      expect(jobsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'backend-engineer', status: 'draft' }),
      );
      expect(result).toBe(created);
    });
  });

  describe('findBySlugOrThrow', () => {
    it('returns a published job for public lookups', async () => {
      const job = buildJob({ status: 'published' });
      jobsRepository.findBySlug.mockResolvedValue(job);

      await expect(service.findBySlugOrThrow('backend-engineer', true)).resolves.toBe(
        job,
      );
    });

    it('throws JOBS_001 when a non-published job is looked up publicly', async () => {
      jobsRepository.findBySlug.mockResolvedValue(buildJob({ status: 'draft' }));

      await expect(
        service.findBySlugOrThrow('backend-engineer', true),
      ).rejects.toMatchObject(
        new NotFoundException({ code: 'JOBS_001', message: 'Job not found' }),
      );
    });

    it('throws JOBS_001 when no job matches', async () => {
      jobsRepository.findBySlug.mockResolvedValue(null);

      await expect(
        service.findBySlugOrThrow('unknown', true),
      ).rejects.toMatchObject(
        new NotFoundException({ code: 'JOBS_001', message: 'Job not found' }),
      );
    });
  });

  describe('approve', () => {
    it('publishes a pending_review job and sets approvedBy/expiresAt', async () => {
      const job = buildJob({ status: 'pending_review' });
      jobsRepository.findById.mockResolvedValue(job);
      jobsRepository.save.mockImplementation((j) => Promise.resolve(j));

      const result = await service.approve(1, 3);

      expect(result.status).toBe('published');
      expect(result.approvedBy).toBe(3);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('throws JOBS_002 when the job is not pending_review', async () => {
      jobsRepository.findById.mockResolvedValue(buildJob({ status: 'draft' }));

      await expect(service.approve(1, 3)).rejects.toMatchObject(
        new ConflictException({
          code: 'JOBS_002',
          message: 'Job not in a valid state for this action',
        }),
      );
      expect(jobsRepository.save).not.toHaveBeenCalled();
    });
  });
});
