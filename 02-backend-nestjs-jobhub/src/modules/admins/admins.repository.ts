import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsRepository {
  constructor(
    @InjectRepository(Admin)
    private readonly repository: Repository<Admin>,
  ) {}

  findByEmail(email: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { email } });
  }

  findById(id: number): Promise<Admin | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAndCount(skip: number, take: number): Promise<[Admin[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      order: { id: 'ASC' },
    });
  }

  create(data: Partial<Admin>): Admin {
    return this.repository.create(data);
  }

  save(admin: Admin): Promise<Admin> {
    return this.repository.save(admin);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }
}
