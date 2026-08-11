import { Module } from '@nestjs/common';
import { ApplicationsModule } from '../applications/applications.module';
import { CompaniesModule } from '../companies/companies.module';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [UsersModule, CompaniesModule, JobsModule, ApplicationsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
