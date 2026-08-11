import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { PaginatedResult } from '../../shared/types/api-response.type';
import type { PaginationQuery } from '../../shared/utils/pagination.util';
import { ApplicationsService } from './applications.service';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { ApplyToJobDto } from './dto/apply-to-job.dto';

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('jobs/:id/applications')
  @HttpCode(HttpStatus.CREATED)
  async apply(
    @Param('id', ParseIntPipe) jobId: number,
    @Body() dto: ApplyToJobDto,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.apply(
      jobId,
      principal.id,
      dto,
    );
    return ApplicationResponseDto.fromEntity(
      application,
      await this.applicationsService.enrich(application),
    );
  }

  @Get('users/me/applications')
  async findMine(
    @Query() query: PaginationQuery,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<PaginatedResult<ApplicationResponseDto>> {
    const result = await this.applicationsService.findMyApplications(
      principal.id,
      query,
    );
    const items = await Promise.all(
      result.items.map(async (application) =>
        ApplicationResponseDto.fromEntity(
          application,
          await this.applicationsService.enrich(application),
        ),
      ),
    );
    return { items, meta: result.meta };
  }
}
