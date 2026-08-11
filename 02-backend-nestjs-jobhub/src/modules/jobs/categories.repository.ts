import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  findById(id: number): Promise<Category | null> {
    return this.repository.findOne({ where: { id } });
  }

  findAll(): Promise<Category[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }
}
