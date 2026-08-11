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
}
