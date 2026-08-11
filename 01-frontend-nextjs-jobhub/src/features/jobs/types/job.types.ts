export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "remote";
export type JobStatus = "draft" | "pending_review" | "published" | "closed" | "rejected";

export interface Job {
  id: number;
  companyId: number;
  companyName: string | null;
  companyLogoUrl: string | null;
  categoryId: number;
  categoryName: string | null;
  title: string;
  slug: string;
  description: string;
  employmentType: EmploymentType;
  salaryMin: string | null;
  salaryMax: string | null;
  status: JobStatus;
  expiresAt: string | null;
  approvedBy: number | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  employmentType?: EmploymentType;
  categoryId?: number;
  keyword?: string;
}

export interface AdminJobFilters extends JobFilters {
  status?: JobStatus;
}

export interface CreateJobPayload {
  companyId: number;
  categoryId: number;
  title: string;
  description: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
}

export interface UpdateJobPayload {
  categoryId?: number;
  title?: string;
  description?: string;
  employmentType?: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  status?: "pending_review";
}
