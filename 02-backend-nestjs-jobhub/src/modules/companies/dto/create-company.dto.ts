import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import type { CompanySize } from '../entities/company.entity';

const COMPANY_SIZES: CompanySize[] = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

export class CreateCompanyDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(COMPANY_SIZES)
  size?: CompanySize;
}
