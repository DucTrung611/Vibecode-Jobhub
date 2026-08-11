import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
  ) {}

  findBySlug(slug: string): Promise<Company | null> {
    return this.repository.findOne({ where: { slug } });
  }

  findById(id: number): Promise<Company | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAndCount(skip: number, take: number): Promise<[Company[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      order: { id: 'ASC' },
    });
  }

  create(data: Partial<Company>): Company {
    return this.repository.create(data);
  }

  save(company: Company): Promise<Company> {
    return this.repository.save(company);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  count(): Promise<number> {
    return this.repository.count();
  }
}
