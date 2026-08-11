import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { UsersService } from '../users/users.service';
import { PaginatedResult } from '../../shared/types/api-response.type';
import {
  buildPaginationMeta,
  normalizePagination,
  PaginationQuery,
} from '../../shared/utils/pagination.util';
import { ApplicationsRepository } from './applications.repository';
import { ApplyToJobDto } from './dto/apply-to-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { Application } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jobsService: JobsService,
    private readonly usersService: UsersService,
  ) {}

  async apply(
    jobId: number,
    userId: number,
    dto: ApplyToJobDto,
  ): Promise<Application> {
    const job = await this.jobsService.findByIdOrThrow(jobId);
    if (
      job.status !== 'published' ||
      (job.expiresAt && job.expiresAt.getTime() < Date.now())
    ) {
      throw new ConflictException({
        code: 'JOBS_002',
        message: 'Job is closed or expired',
      });
    }

    const existing = await this.applicationsRepository.findByJobAndUser(
      jobId,
      userId,
    );
    if (existing) {
      throw new ConflictException({
        code: 'APPLICATIONS_002',
        message: 'Already applied to this job',
      });
    }

    const user = await this.usersService.findByIdOrThrow(userId);
    if (!user.resumeUrl) {
      throw new BadRequestException({
        code: 'VALIDATION_001',
        message: 'Upload a resume before applying to a job',
        details: [{ field: 'resumeUrl', message: 'No resume on file' }],
      });
    }

    const application = this.applicationsRepository.create({
      jobId,
      userId,
      resumeUrl: user.resumeUrl,
      coverLetter: dto.coverLetter ?? null,
      status: 'pending',
    });
    return this.applicationsRepository.save(application);
  }

  async findByIdOrThrow(id: number): Promise<Application> {
    const application = await this.applicationsRepository.findById(id);
    if (!application) {
      throw new NotFoundException({
        code: 'APPLICATIONS_001',
        message: 'Application not found',
      });
    }
    return application;
  }

  async findMyApplications(
    userId: number,
    query: PaginationQuery,
  ): Promise<PaginatedResult<Application>> {
    const { page, limit, skip } = normalizePagination(query);
    const [items, total] = await this.applicationsRepository.findAndCountByUser(
      userId,
      skip,
      limit,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findForJob(
    jobId: number,
    query: PaginationQuery,
  ): Promise<PaginatedResult<Application>> {
    await this.jobsService.findByIdOrThrow(jobId);
    const { page, limit, skip } = normalizePagination(query);
    const [items, total] = await this.applicationsRepository.findAndCountByJob(
      jobId,
      skip,
      limit,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateStatus(
    id: number,
    dto: UpdateApplicationStatusDto,
    adminId: number,
  ): Promise<Application> {
    const application = await this.findByIdOrThrow(id);
    application.status = dto.status;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    return this.applicationsRepository.save(application);
  }

  async enrich(
    application: Application,
  ): Promise<{ jobTitle: string | null; userFullName: string | null }> {
    const [job, user] = await Promise.all([
      this.jobsService.findByIdOrThrow(application.jobId).catch(() => null),
      this.usersService.findByIdOrThrow(application.userId).catch(() => null),
    ]);
    return {
      jobTitle: job?.title ?? null,
      userFullName: user?.fullName ?? null,
    };
  }

  count(): Promise<number> {
    return this.applicationsRepository.count();
  }
}
