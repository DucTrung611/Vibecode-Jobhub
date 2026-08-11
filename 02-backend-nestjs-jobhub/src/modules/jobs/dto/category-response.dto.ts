import { Category } from '../entities/category.entity';

export class CategoryResponseDto {
  id: number;
  name: string;
  slug: string;
  jobCount: number;

  static fromEntity(category: Category, jobCount = 0): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.slug = category.slug;
    dto.jobCount = jobCount;
    return dto;
  }
}
