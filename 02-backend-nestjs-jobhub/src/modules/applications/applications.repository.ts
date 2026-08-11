import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';

@Injectable()
export class ApplicationsRepository {
  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,
  ) {}

  findById(id: number): Promise<Application | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByJobAndUser(jobId: number, userId: number): Promise<Application | null> {
    return this.repository.findOne({ where: { jobId, userId } });
  }

  async findAndCountByUser(
    userId: number,
    skip: number,
    take: number,
  ): Promise<[Application[], number]> {
    return this.repository.findAndCount({
      where: { userId },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findAndCountByJob(
    jobId: number,
    skip: number,
    take: number,
  ): Promise<[Application[], number]> {
    return this.repository.findAndCount({
      where: { jobId },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  create(data: Partial<Application>): Application {
    return this.repository.create(data);
  }

  save(application: Application): Promise<Application> {
    return this.repository.save(application);
  }
}
