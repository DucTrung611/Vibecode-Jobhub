import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResult } from '../../shared/types/api-response.type';
import {
  buildPaginationMeta,
  normalizePagination,
  PaginationQuery,
} from '../../shared/utils/pagination.util';
import { assignDefined } from '../../shared/utils/object.util';
import { slugify } from '../../shared/utils/slugify.util';
import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Company>> {
    const { page, limit, skip } = normalizePagination(query);
    const [items, total] = await this.companiesRepository.findAndCount(
      skip,
      limit,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlugOrThrow(slug: string): Promise<Company> {
    const company = await this.companiesRepository.findBySlug(slug);
    if (!company) {
      throw new NotFoundException({
        code: 'COMPANIES_001',
        message: 'Company not found',
      });
    }
    return company;
  }

  async findByIdOrThrow(id: number): Promise<Company> {
    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException({
        code: 'COMPANIES_001',
        message: 'Company not found',
      });
    }
    return company;
  }

  async create(
    dto: CreateCompanyDto,
    createdByAdminId: number,
  ): Promise<Company> {
    const slug = slugify(dto.name);
    const existing = await this.companiesRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException({
        code: 'COMPANIES_002',
        message: 'Slug already exists',
      });
    }

    const company = this.companiesRepository.create({
      name: dto.name,
      slug,
      logoUrl: dto.logoUrl ?? null,
      description: dto.description ?? null,
      size: dto.size ?? null,
      createdBy: createdByAdminId,
    });
    return this.companiesRepository.save(company);
  }

  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findByIdOrThrow(id);
    assignDefined(company, dto);
    return this.companiesRepository.save(company);
  }

  async deactivate(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.companiesRepository.softDelete(id);
  }

  count(): Promise<number> {
    return this.companiesRepository.count();
  }
}
