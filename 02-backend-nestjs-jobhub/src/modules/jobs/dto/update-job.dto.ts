import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import type { EmploymentType, JobStatus } from '../entities/job.entity';

const EMPLOYMENT_TYPES: EmploymentType[] = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'remote',
];

/**
 * `status` only accepts `pending_review` here — "submit for review" is
 * modeled as a status transition through this same update endpoint (no
 * separate route in API_SPEC.md). `published`/`rejected` are set only by
 * approve()/reject(); `closed` is out of scope for this phase.
 */
const UPDATABLE_STATUSES: JobStatus[] = ['pending_review'];

export class UpdateJobDto {
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EMPLOYMENT_TYPES)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsEnum(UPDATABLE_STATUSES)
  status?: JobStatus;
}
