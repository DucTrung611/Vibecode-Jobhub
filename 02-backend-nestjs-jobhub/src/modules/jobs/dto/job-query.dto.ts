import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import type { EmploymentType, JobStatus } from '../entities/job.entity';

const EMPLOYMENT_TYPES: EmploymentType[] = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'remote',
];

const JOB_STATUSES: JobStatus[] = [
  'draft',
  'pending_review',
  'published',
  'closed',
  'rejected',
];

export class JobQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsEnum(EMPLOYMENT_TYPES)
  employmentType?: EmploymentType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}

export class AdminJobQueryDto extends JobQueryDto {
  @IsOptional()
  @IsEnum(JOB_STATUSES)
  status?: JobStatus;
}
