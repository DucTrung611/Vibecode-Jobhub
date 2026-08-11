import { IsEnum } from 'class-validator';
import type { ApplicationStatus } from '../entities/application.entity';

const APPLICATION_STATUSES: ApplicationStatus[] = [
  'pending',
  'reviewed',
  'shortlisted',
  'rejected',
  'accepted',
];

export class UpdateApplicationStatusDto {
  @IsEnum(APPLICATION_STATUSES)
  status: ApplicationStatus;
}
