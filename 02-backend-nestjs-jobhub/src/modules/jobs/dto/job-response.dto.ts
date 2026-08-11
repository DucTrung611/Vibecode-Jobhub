import { EmploymentType, Job, JobStatus } from '../entities/job.entity';

export class JobResponseDto {
  id: number;
  companyId: number;
  companyName: string | null;
  companyLogoUrl: string | null;
  categoryId: number;
  categoryName: string | null;
  title: string;
  slug: string;
  description: string;
  employmentType: EmploymentType;
  salaryMin: string | null;
  salaryMax: string | null;
  status: JobStatus;
  expiresAt: Date | null;
  approvedBy: number | null;
  createdAt: Date;

  static fromEntity(
    job: Job,
    enrichment?: {
      companyName?: string | null;
      companyLogoUrl?: string | null;
      categoryName?: string | null;
    },
  ): JobResponseDto {
    const dto = new JobResponseDto();
    dto.id = job.id;
    dto.companyId = job.companyId;
    dto.companyName = enrichment?.companyName ?? null;
    dto.companyLogoUrl = enrichment?.companyLogoUrl ?? null;
    dto.categoryId = job.categoryId;
    dto.categoryName = enrichment?.categoryName ?? null;
    dto.title = job.title;
    dto.slug = job.slug;
    dto.description = job.description;
    dto.employmentType = job.employmentType;
    dto.salaryMin = job.salaryMin;
    dto.salaryMax = job.salaryMax;
    dto.status = job.status;
    dto.expiresAt = job.expiresAt;
    dto.approvedBy = job.approvedBy;
    dto.createdAt = job.createdAt;
    return dto;
  }
}
