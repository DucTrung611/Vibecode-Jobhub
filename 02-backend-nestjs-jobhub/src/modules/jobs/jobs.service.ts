import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { PaginatedResult } from '../../shared/types/api-response.type';
import { assignDefined } from '../../shared/utils/object.util';
import {
  buildPaginationMeta,
  normalizePagination,
  PaginationQuery,
} from '../../shared/utils/pagination.util';
import { slugify } from '../../shared/utils/slugify.util';
import { CategoriesRepository } from './categories.repository';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Category } from './entities/category.entity';
import { Job } from './entities/job.entity';
import { JobsRepository, JobFilter } from './jobs.repository';
import { SavedJobsRepository } from './saved-jobs.repository';

const JOB_EXPIRY_DAYS = 30;

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly savedJobsRepository: SavedJobsRepository,
    private readonly companiesService: CompaniesService,
  ) {}

  async findPublished(
    query: PaginationQuery & { employmentType?: string; categoryId?: number },
  ): Promise<PaginatedResult<Job>> {
    const { page, limit, skip } = normalizePagination(query);
    const filter: JobFilter = {
      status: 'published',
      categoryId: query.categoryId,
      employmentType: query.employmentType as JobFilter['employmentType'],
    };
    const [items, total] = await this.jobsRepository.findAndCount(
      filter,
      skip,
      limit,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findAllForAdmin(
    query: PaginationQuery & { status?: string; employmentType?: string; categoryId?: number },
  ): Promise<PaginatedResult<Job>> {
    const { page, limit, skip } = normalizePagination(query);
    const filter: JobFilter = {
      status: query.status as JobFilter['status'],
      categoryId: query.categoryId,
      employmentType: query.employmentType as JobFilter['employmentType'],
    };
    const [items, total] = await this.jobsRepository.findAndCount(
      filter,
      skip,
      limit,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlugOrThrow(slug: string, publicOnly: boolean): Promise<Job> {
    const job = await this.jobsRepository.findBySlug(slug);
    if (!job || (publicOnly && job.status !== 'published')) {
      throw new NotFoundException({
        code: 'JOBS_001',
        message: 'Job not found',
      });
    }
    return job;
  }

  async findByIdOrThrow(id: number): Promise<Job> {
    const job = await this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException({
        code: 'JOBS_001',
        message: 'Job not found',
      });
    }
    return job;
  }

  async create(dto: CreateJobDto): Promise<Job> {
    await this.companiesService.findByIdOrThrow(dto.companyId);
    await this.categoryExistsOrThrow(dto.categoryId);

    const slug = await this.uniqueSlugFor(dto.title);
    const job = this.jobsRepository.create({
      companyId: dto.companyId,
      categoryId: dto.categoryId,
      title: dto.title,
      slug,
      description: dto.description,
      employmentType: dto.employmentType,
      salaryMin: dto.salaryMin !== undefined ? String(dto.salaryMin) : null,
      salaryMax: dto.salaryMax !== undefined ? String(dto.salaryMax) : null,
      status: 'draft',
    });
    return this.jobsRepository.save(job);
  }

  async update(id: number, dto: UpdateJobDto): Promise<Job> {
    const job = await this.findByIdOrThrow(id);

    if (dto.categoryId !== undefined) {
      await this.categoryExistsOrThrow(dto.categoryId);
    }
    if (dto.status !== undefined && dto.status !== 'pending_review') {
      throw new ConflictException({
        code: 'JOBS_002',
        message: 'Job not in a valid state for this action',
      });
    }
    if (dto.status === 'pending_review' && job.status !== 'draft') {
      throw new ConflictException({
        code: 'JOBS_002',
        message: 'Job not in a valid state for this action',
      });
    }

    assignDefined(job, {
      ...dto,
      salaryMin:
        dto.salaryMin !== undefined ? String(dto.salaryMin) : undefined,
      salaryMax:
        dto.salaryMax !== undefined ? String(dto.salaryMax) : undefined,
    });
    return this.jobsRepository.save(job);
  }

  async approve(id: number, adminId: number): Promise<Job> {
    const job = await this.findByIdOrThrow(id);
    if (job.status !== 'pending_review') {
      throw new ConflictException({
        code: 'JOBS_002',
        message: 'Job not in a valid state for this action',
      });
    }
    job.status = 'published';
    job.approvedBy = adminId;
    job.expiresAt = new Date(
      Date.now() + JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    return this.jobsRepository.save(job);
  }

  async reject(id: number, adminId: number): Promise<Job> {
    const job = await this.findByIdOrThrow(id);
    if (job.status !== 'pending_review') {
      throw new ConflictException({
        code: 'JOBS_002',
        message: 'Job not in a valid state for this action',
      });
    }
    job.status = 'rejected';
    job.approvedBy = adminId;
    return this.jobsRepository.save(job);
  }

  async deactivate(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.jobsRepository.softDelete(id);
  }

  async saveForUser(userId: number, jobId: number): Promise<void> {
    await this.findByIdOrThrow(jobId);
    const existing = await this.savedJobsRepository.findOne(userId, jobId);
    if (existing) return;
    const savedJob = this.savedJobsRepository.create({ userId, jobId });
    await this.savedJobsRepository.save(savedJob);
  }

  async unsaveForUser(userId: number, jobId: number): Promise<void> {
    await this.savedJobsRepository.delete(userId, jobId);
  }

  async findSavedByUser(
    userId: number,
    query: PaginationQuery,
  ): Promise<PaginatedResult<Job>> {
    const { page, limit, skip } = normalizePagination(query);
    const [savedJobs, total] = await this.savedJobsRepository.findAndCount(
      userId,
      skip,
      limit,
    );
    const jobs = await this.jobsRepository.findByIds(
      savedJobs.map((s) => s.jobId),
    );
    const jobsById = new Map(jobs.map((job) => [job.id, job]));
    const items = savedJobs
      .map((s) => jobsById.get(s.jobId))
      .filter((job): job is Job => job !== undefined);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findCategoriesWithCounts(): Promise<CategoryResponseDto[]> {
    const [categories, counts] = await Promise.all([
      this.categoriesRepository.findAll(),
      this.jobsRepository.countByCategory(),
    ]);
    const countByCategoryId = new Map(
      counts.map((c) => [Number(c.categoryId), Number(c.count)]),
    );
    return categories.map((category) =>
      CategoryResponseDto.fromEntity(
        category,
        countByCategoryId.get(category.id) ?? 0,
      ),
    );
  }

  findLatestPublished(take: number): Promise<Job[]> {
    return this.jobsRepository.findLatestPublished(take);
  }

  countActive(): Promise<number> {
    return this.jobsRepository.countByStatus('published');
  }

  async enrich(job: Job): Promise<{
    companyName: string | null;
    companyLogoUrl: string | null;
    categoryName: string | null;
  }> {
    const [company, category] = await Promise.all([
      this.companiesService.findByIdOrThrow(job.companyId).catch(() => null),
      this.categoriesRepository.findById(job.categoryId),
    ]);
    return {
      companyName: company?.name ?? null,
      companyLogoUrl: company?.logoUrl ?? null,
      categoryName: category?.name ?? null,
    };
  }

  private async categoryExistsOrThrow(categoryId: number): Promise<Category> {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException({
        code: 'JOBS_001',
        message: 'Category not found',
      });
    }
    return category;
  }

  private async uniqueSlugFor(title: string): Promise<string> {
    const base = slugify(title);
    let slug = base;
    let suffix = 1;
    while (await this.jobsRepository.findBySlug(slug)) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }
}
