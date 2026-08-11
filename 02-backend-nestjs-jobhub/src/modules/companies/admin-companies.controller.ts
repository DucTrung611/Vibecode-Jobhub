import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { RequirePermission } from '../../shared/decorators/require-permission.decorator';
import type { AuthenticatedPrincipal } from '../../core/auth/strategies/jwt.strategy';
import { CompaniesService } from './companies.service';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('admin/companies')
export class AdminCompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @RequirePermission('companies.create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser() principal: AuthenticatedPrincipal,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesService.create(dto, principal.id);
    return CompanyResponseDto.fromEntity(company);
  }

  @Patch(':id')
  @RequirePermission('companies.update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesService.update(id, dto);
    return CompanyResponseDto.fromEntity(company);
  }

  @Delete(':id')
  @RequirePermission('companies.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.companiesService.deactivate(id);
  }
}
