import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from './entities/saved-job.entity';

@Injectable()
export class SavedJobsRepository {
  constructor(
    @InjectRepository(SavedJob)
    private readonly repository: Repository<SavedJob>,
  ) {}

  findOne(userId: number, jobId: number): Promise<SavedJob | null> {
    return this.repository.findOne({ where: { userId, jobId } });
  }

  async findAndCount(
    userId: number,
    skip: number,
    take: number,
  ): Promise<[SavedJob[], number]> {
    return this.repository.findAndCount({
      where: { userId },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  create(data: Partial<SavedJob>): SavedJob {
    return this.repository.create(data);
  }

  save(savedJob: SavedJob): Promise<SavedJob> {
    return this.repository.save(savedJob);
  }

  async delete(userId: number, jobId: number): Promise<void> {
    await this.repository.delete({ userId, jobId });
  }
}
