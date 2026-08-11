import { IsOptional, IsString } from 'class-validator';

export class ApplyToJobDto {
  @IsOptional()
  @IsString()
  coverLetter?: string;
}
