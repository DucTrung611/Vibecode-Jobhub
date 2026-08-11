import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../shared/decorators/public.decorator';
import { PaginatedResult } from '../../shared/types/api-response.type';
import type { PaginationQuery } from '../../shared/utils/pagination.util';
import { CompaniesService } from './companies.service';
import { CompanyResponseDto } from './dto/company-response.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Public()
  @Get()
  async findAll(
    @Query() query: PaginationQuery,
  ): Promise<PaginatedResult<CompanyResponseDto>> {
    const result = await this.companiesService.findAll(query);
    return {
      items: result.items.map((company) =>
        CompanyResponseDto.fromEntity(company),
      ),
      meta: result.meta,
    };
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<CompanyResponseDto> {
    const company = await this.companiesService.findBySlugOrThrow(slug);
    return CompanyResponseDto.fromEntity(company);
  }
}
