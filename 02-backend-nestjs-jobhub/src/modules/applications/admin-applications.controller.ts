import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { PaginatedResult } from '../../shared/types/api-response.type';
import type { PaginationQuery } from '../../shared/utils/pagination.util';
import { ApplicationsService } from './applications.service';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller()
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('admin/jobs/:id/applications')
  @RequirePermission('applications.read')
  async findForJob(
    @Param('id', ParseIntPipe) jobId: number,
    @Query() query: PaginationQuery,
  ): Promise<PaginatedResult<ApplicationResponseDto>> {
    const result = await this.applicationsService.findForJob(jobId, query);
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

  @Patch('admin/applications/:id/status')
  @RequirePermission('applications.review')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.updateStatus(
      id,
      dto,
      principal.id,
    );
    return ApplicationResponseDto.fromEntity(
      application,
      await this.applicationsService.enrich(application),
    );
  }
}
