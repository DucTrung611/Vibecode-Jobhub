import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module';
import { AdminJobsController } from './admin-jobs.controller';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';
import { Job } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { JobsController } from './jobs.controller';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { SavedJobsController } from './saved-jobs.controller';
import { SavedJobsRepository } from './saved-jobs.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Category, SavedJob]),
    CompaniesModule,
  ],
  controllers: [JobsController, AdminJobsController, SavedJobsController],
  providers: [
    JobsService,
    JobsRepository,
    CategoriesRepository,
    SavedJobsRepository,
  ],
  exports: [JobsService],
})
export class JobsModule {}
