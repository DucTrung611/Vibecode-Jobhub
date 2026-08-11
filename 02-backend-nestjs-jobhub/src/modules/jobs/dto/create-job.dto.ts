import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import type { EmploymentType } from '../entities/job.entity';

const EMPLOYMENT_TYPES: EmploymentType[] = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'remote',
];

export class CreateJobDto {
  @IsInt()
  companyId: number;

  @IsInt()
  categoryId: number;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  description: string;

  @IsEnum(EMPLOYMENT_TYPES)
  employmentType: EmploymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;
}
