import { Application, ApplicationStatus } from '../entities/application.entity';

export class ApplicationResponseDto {
  id: number;
  jobId: number;
  jobTitle: string | null;
  userId: number;
  userFullName: string | null;
  resumeUrl: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  reviewedBy: number | null;
  reviewedAt: Date | null;
  createdAt: Date;

  static fromEntity(
    application: Application,
    enrichment?: { jobTitle?: string | null; userFullName?: string | null },
  ): ApplicationResponseDto {
    const dto = new ApplicationResponseDto();
    dto.id = application.id;
    dto.jobId = application.jobId;
    dto.jobTitle = enrichment?.jobTitle ?? null;
    dto.userId = application.userId;
    dto.userFullName = enrichment?.userFullName ?? null;
    dto.resumeUrl = application.resumeUrl;
    dto.coverLetter = application.coverLetter;
    dto.status = application.status;
    dto.reviewedBy = application.reviewedBy;
    dto.reviewedAt = application.reviewedAt;
    dto.createdAt = application.createdAt;
    return dto;
  }
}
