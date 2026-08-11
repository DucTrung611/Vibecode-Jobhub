import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name } });
  }

  findById(id: number): Promise<Role | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAndCount(skip: number, take: number): Promise<[Role[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      order: { id: 'ASC' },
    });
  }

  create(data: Partial<Role>): Role {
    return this.repository.create(data);
  }

  save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }
}
