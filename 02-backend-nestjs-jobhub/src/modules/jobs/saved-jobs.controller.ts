import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { PaginatedResult } from '../../shared/types/api-response.type';
import type { PaginationQuery } from '../../shared/utils/pagination.util';
import { JobResponseDto } from './dto/job-response.dto';
import { JobsService } from './jobs.service';

@Controller('users/me/saved-jobs')
export class SavedJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(
    @Query() query: PaginationQuery,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<PaginatedResult<JobResponseDto>> {
    const result = await this.jobsService.findSavedByUser(
      principal.id,
      query,
    );
    const items = await Promise.all(
      result.items.map(async (job) =>
        JobResponseDto.fromEntity(job, await this.jobsService.enrich(job)),
      ),
    );
    return { items, meta: result.meta };
  }
}
