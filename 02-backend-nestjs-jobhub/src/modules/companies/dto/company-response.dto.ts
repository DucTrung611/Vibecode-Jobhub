import { Company, CompanySize } from '../entities/company.entity';

export class CompanyResponseDto {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  size: CompanySize | null;
  createdBy: number;
  createdAt: Date;

  static fromEntity(company: Company): CompanyResponseDto {
    const dto = new CompanyResponseDto();
    dto.id = company.id;
    dto.name = company.name;
    dto.slug = company.slug;
    dto.logoUrl = company.logoUrl;
    dto.description = company.description;
    dto.size = company.size;
    dto.createdBy = company.createdBy;
    dto.createdAt = company.createdAt;
    return dto;
  }
}
