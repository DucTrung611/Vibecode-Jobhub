import { Controller, Get } from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { CompaniesService } from '../companies/companies.service';
import { JobsService } from '../jobs/jobs.service';
import { UsersService } from '../users/users.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly jobsService: JobsService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Get('stats')
  async stats(): Promise<DashboardStatsDto> {
    const [totalUsers, totalCompanies, activeJobs, totalApplications] =
      await Promise.all([
        this.usersService.count(),
        this.companiesService.count(),
        this.jobsService.countActive(),
        this.applicationsService.count(),
      ]);
    return { totalUsers, totalCompanies, activeJobs, totalApplications };
  }
}
