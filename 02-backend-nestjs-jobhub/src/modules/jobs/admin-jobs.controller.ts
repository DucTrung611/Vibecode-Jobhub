import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { PaginatedResult } from '../../shared/types/api-response.type';
import { AdminJobQueryDto } from './dto/job-query.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @RequirePermission('jobs.read')
  async findAll(
    @Query() query: AdminJobQueryDto,
  ): Promise<PaginatedResult<JobResponseDto>> {
    const result = await this.jobsService.findAllForAdmin(query);
    const items = await Promise.all(
      result.items.map(async (job) =>
        JobResponseDto.fromEntity(job, await this.jobsService.enrich(job)),
      ),
    );
    return { items, meta: result.meta };
  }

  @Get(':id')
  @RequirePermission('jobs.read')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<JobResponseDto> {
    const job = await this.jobsService.findByIdOrThrow(id);
    return JobResponseDto.fromEntity(job, await this.jobsService.enrich(job));
  }

  @Post()
  @RequirePermission('jobs.create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateJobDto): Promise<JobResponseDto> {
    const job = await this.jobsService.create(dto);
    return JobResponseDto.fromEntity(job, await this.jobsService.enrich(job));
  }

  @Patch(':id')
  @RequirePermission('jobs.update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.update(id, dto);
    return JobResponseDto.fromEntity(job, await this.jobsService.enrich(job));
  }

  @Post(':id/approve')
  @RequirePermission('jobs.approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.approve(id, principal.id);
    return JobResponseDto.fromEntity(job, await this.jobsService.enrich(job));
  }

  @Post(':id/reject')
  @RequirePermission('jobs.approve')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.reject(id, principal.id);
    return JobResponseDto.fromEntity(job, await this.jobsService.enrich(job));
  }

  @Delete(':id')
  @RequirePermission('jobs.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.jobsService.deactivate(id);
  }
}
