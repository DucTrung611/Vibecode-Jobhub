import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  findById(id: number): Promise<Permission | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByIds(ids: number[]): Promise<Permission[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.repository.find({ where: { id: In(ids) } });
  }

  findByName(name: string): Promise<Permission | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findAndCount(
    skip: number,
    take: number,
  ): Promise<[Permission[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      order: { id: 'ASC' },
    });
  }
}
