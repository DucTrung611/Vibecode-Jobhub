import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { PaginatedResult } from '../../shared/types/api-response.type';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Public()
  @Get()
  async findAll(
    @Query() query: JobQueryDto,
  ): Promise<PaginatedResult<JobResponseDto>> {
    const result = await this.jobsService.findPublished(query);
    const items = await Promise.all(
      result.items.map(async (job) =>
        JobResponseDto.fromEntity(job, await this.jobsService.enrich(job)),
      ),
    );
    return { items, meta: result.meta };
  }

  @Public()
  @Get('categories')
  findCategories(): Promise<CategoryResponseDto[]> {
    return this.jobsService.findCategoriesWithCounts();
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<JobResponseDto> {
    const job = await this.jobsService.findBySlugOrThrow(slug, true);
    return JobResponseDto.fromEntity(job, await this.jobsService.enrich(job));
  }

  @Post(':id/save')
  @HttpCode(HttpStatus.NO_CONTENT)
  async save(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<void> {
    await this.jobsService.saveForUser(principal.id, id);
  }

  @Delete(':id/save')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsave(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<void> {
    await this.jobsService.unsaveForUser(principal.id, id);
  }
}
