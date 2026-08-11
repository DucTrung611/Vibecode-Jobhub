import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EmploymentType, Job, JobStatus } from './entities/job.entity';

export interface JobFilter {
  status?: JobStatus;
  categoryId?: number;
  employmentType?: EmploymentType;
}

@Injectable()
export class JobsRepository {
  constructor(
    @InjectRepository(Job)
    private readonly repository: Repository<Job>,
  ) {}

  findBySlug(slug: string): Promise<Job | null> {
    return this.repository.findOne({ where: { slug } });
  }

  findById(id: number): Promise<Job | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByIds(ids: number[]): Promise<Job[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.repository.find({ where: { id: In(ids) } });
  }

  async findAndCount(
    filter: JobFilter,
    skip: number,
    take: number,
  ): Promise<[Job[], number]> {
    return this.repository.findAndCount({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
        ...(filter.employmentType
          ? { employmentType: filter.employmentType }
          : {}),
      },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  findLatestPublished(take: number): Promise<Job[]> {
    return this.repository.find({
      where: { status: 'published' },
      order: { createdAt: 'DESC' },
      take,
    });
  }

  countByCategory(): Promise<Array<{ categoryId: number; count: string }>> {
    return this.repository
      .createQueryBuilder('job')
      .select('job.category_id', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('job.status = :status', { status: 'published' })
      .groupBy('job.category_id')
      .getRawMany();
  }

  countByStatus(status: JobStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  create(data: Partial<Job>): Job {
    return this.repository.create(data);
  }

  save(job: Job): Promise<Job> {
    return this.repository.save(job);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }
}
